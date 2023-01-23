import { assert } from 'asserts';
import { Pool, PoolClient } from 'postgres';

import { PendingSchema, type Pending } from './model/db/pending.ts';
import type { Session } from './model/db/session.ts';
import type { PushSubscription } from './model/db/subscription.ts';
import type { User } from './model/db/user.ts';

export class Database {
    #client: PoolClient;

    private constructor(client: PoolClient) {
        this.#client = client
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
        const { rows: [ first, ...rest ] } = await this.#client.queryObject`INSERT INTO pending DEFAULT VALUES RETURNING *`;
        assert(rest.length == 0);
        return PendingSchema.parse(first);
    }

    async upgradeSession({ id, user, expiration, access_token }: Session) {
        const transaction = this.#client.createTransaction('upgrade');
        await transaction.queryArray`DELETE FROM pending WHERE id = ${id}`;
        await transaction.queryArray`INSERT INTO session (id,user,expiration,access_token) VALUES (${id},${user},${expiration.toISOString()},${access_token})`;
        await transaction.commit();
    }

    upsertUser({ id, name, email }: User) {
        return this.#client.queryArray`INSERT INTO user (id,name,email) VALUES (${id},${name},${email}) ON CONFLICT DO UPDATE SET name = ${name}, email = ${email}`;
    }

    pushSubscription({ id, endpoint, expirationTime }: PushSubscription) {
        const expires = expirationTime?.toISOString() || 'infinity';
        return this.#client.queryArray`INSERT INTO subscription (id,endpoint,expiration) VALUES (${id},${endpoint},${expires})`;
    }
}
