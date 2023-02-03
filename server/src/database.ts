import { assert } from 'asserts';
import { Pool, PoolClient } from 'postgres';
import { z } from 'zod';

import { InvitationSchema } from './model/db/invitation.ts';
import type { Office } from './model/db/office.ts';
import { type Pending, PendingSchema } from './model/db/pending.ts';
import type { Session } from './model/db/session.ts';
import type { PushSubscription } from './model/db/subscription.ts';
import { type User, UserSchema } from './model/db/user.ts';

export class Database {
    #client: PoolClient;

    private constructor(client: PoolClient) {
        this.#client = client;
    }

    static async fromPool(pool: Pool) {
        const client = await pool.connect();
        await client.connect();
        return new Database(client);
    }

    release() {
        return this.#client.release();
    }

    async checkValidSession(sid: string) {
        const { rows } = await this.#client.queryObject`SELECT 1 FROM session WHERE id = ${sid}`;
        return rows.length > 0;
    }

    async generatePendingSession(): Promise<Pending> {
        const { rows: [first, ...rest] } = await this.#client
            .queryObject`INSERT INTO pending DEFAULT VALUES RETURNING *`;
        assert(rest.length === 0);
        return PendingSchema.parse(first);
    }

    async upgradeSession({ id, user, expiration, access_token }: Session) {
        const transaction = this.#client.createTransaction('upgrade', { isolation_level: 'serializable' });
        await transaction.queryArray`DELETE FROM pending WHERE id = ${id}`;
        await transaction
            .queryArray`INSERT INTO session (id,user,expiration,access_token) VALUES (${id},${user},${expiration.toISOString()},${access_token})`;
        await transaction.commit();
    }

    /** @deprecated */
    upsertUser({ id, name, email }: User) {
        return this.#client
            .queryArray`INSERT INTO user (id,name,email) VALUES (${id},${name},${email}) ON CONFLICT DO UPDATE SET name = ${name}, email = ${email}`;
    }

    /**
     * If a user already exists in the database, simply update their information (in which
     * case `null` is returned). Otherwise, we delete all of the invites of the specified user
     * and return an array of the office IDs to which the user is invited.
     */
    async insertInvitedUser({ id, name, email }: User): Promise<Office['id'][] | null> {
        const transaction = this.#client.createTransaction('registration', { isolation_level: 'serializable' });
        const { rowCount } = await transaction
            .queryArray`UPDATE user SET name = ${name}, email = ${email} WHERE id = ${id}`;
        assert(rowCount !== undefined);

        // User already exists
        if (rowCount === 1) {
            await transaction.commit();
            return null;
        }

        // Check the invite list first
        assert(rowCount === 0);
        const { rows } = await transaction
            .queryObject`DELETE FROM invitation WHERE email = ${email} RETURNING office,permission`;
        const invites = InvitationSchema.pick({ office: true, permission: true }).array().parse(rows);

        // Add the user to all the offices (if any)
        await Promise.all(invites.map(({ office, permission }) =>
            transaction.queryArray`INSERT INTO staff (user,office,permission) VALUES (${id},${office},${permission})`));
        await transaction.commit();
        return invites.map(i => i.office);
    }

    pushSubscription({ id, endpoint, expirationTime }: PushSubscription) {
        const expires = expirationTime?.toISOString() || 'infinity';
        return this.#client
            .queryArray`INSERT INTO subscription (id,endpoint,expiration) VALUES (${id},${endpoint},${expires})`;
    }

    async getUserFromSession(sid: string) {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`SELECT u.name, u.email FROM session AS s INNER JOIN user AS u ON s.user = u.id WHERE s.id = ${sid} LIMIT 1`;
        assert(rest.length === 0);
        return UserSchema.omit({ id: true }).parse(first);
    }
}
