import { assert } from 'asserts';
import { Pool, PoolClient } from 'postgres';

import { type Invitation, InvitationSchema } from './model/db/invitation.ts';
import { type Office, OfficeSchema } from './model/db/office.ts';
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
            .queryObject('INSERT INTO pending DEFAULT VALUES RETURNING *');
        assert(rest.length === 0);
        return PendingSchema.parse(first);
    }

    /** Gets the nonce of a pending session. If no such session exists, an empty array is returned. */
    async getPendingSessionNonce(sid: string): Promise<Uint8Array> {
        const { rows: [ first, ...rest ] } = await this.#client.queryObject`SELECT nonce FROM pending WHERE id = ${sid} LIMIT 1`;
        assert(rest.length === 0);
        return first === undefined
            ? new Uint8Array
            : PendingSchema.pick({ nonce: true }).parse(first).nonce;
    }

    async upgradeSession({ id, user_id, expiration, access_token }: Session) {
        const transaction = this.#client.createTransaction('upgrade', { isolation_level: 'serializable' });
        await transaction.begin();
        await transaction.queryArray`DELETE FROM pending WHERE id = ${id}`;
        await transaction
            .queryArray`INSERT INTO session (id,user_id,expiration,access_token) VALUES (${id},${user_id},${expiration.toISOString()},${access_token})`;
        await transaction.commit();
    }

    /** Upserts a user to the invite list and returns the creation date. */
    async upsertInvitation({ office, email, permission }: Omit<Invitation, 'creation'>): Promise<Date> {
        const { rows: [ first, ...rest ] } = await this.#client.queryObject`
            INSERT INTO invitation (office,email,permission)
                VALUES (${office},${email},${permission})
                ON CONFLICT (office,email) DO UPDATE SET permission = ${permission}, creation = DEFAULT
                RETURNING creation`;
        assert(rest.length === 0);
        return InvitationSchema.pick({ creation: true }).parse(first).creation;
    }

    /**
     * If a user already exists in the database, simply update their information (in which
     * case `null` is returned). Otherwise, we delete all of the invites of the specified user
     * and return an array of the office IDs to which the user is invited.
     */
    async insertInvitedUser({ id, name, email }: User): Promise<Office['id'][] | null> {
        const transaction = this.#client.createTransaction('registration', { isolation_level: 'serializable' });
        await transaction.begin();

        const { rowCount } = await transaction
            .queryArray`UPDATE users SET name = ${name}, email = ${email} WHERE id = ${id}`;
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

        // Add the user into the system
        await transaction.queryArray`INSERT INTO users (id,name,email) VALUES (${id},${name},${email})`;

        // Add the user to all the offices (if any)
        for (const { office, permission } of invites)
            await transaction.queryArray`INSERT INTO staff (user_id,office,permission) VALUES (${id},${office},${permission})`;

        await transaction.commit();
        return invites.map(i => i.office);
    }

    pushSubscription({ id, endpoint, expirationTime }: PushSubscription) {
        const expires = expirationTime?.toISOString() || 'infinity';
        return this.#client
            .queryArray`INSERT INTO subscription (id,endpoint,expiration) VALUES (${id},${endpoint},${expires})`;
    }

    async getUserFromSession(sid: string): Promise<Omit<User, 'id'>> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`SELECT u.name, u.email FROM session AS s INNER JOIN users AS u ON s.user = u.id WHERE s.id = ${sid} LIMIT 1`;
        assert(rest.length === 0);
        return UserSchema.omit({ id: true }).parse(first);
    }

    async createOffice(name: string): Promise<number> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`INSERT INTO office (name) VALUES (${name}) RETURNING id`;
        assert(rest.length === 0);
        return OfficeSchema.pick({ id: true }).parse(first).id;
    }
}
