import { assert } from 'asserts';
import { Pool, PoolClient } from 'postgres';

import { PendingSchema, type Pending } from './model/db/pending.ts';

export class Database {
    #client: PoolClient;

    private constructor(client: PoolClient) { this.#client = client }

    static async fromPool(pool: Pool) {
        const client = await pool.connect();
        await client.connect();
        return new Database(client);
    }

    release() { return this.#client.release(); }

    async checkValidSession(sid: string) {
        const { rows } = await this.#client.queryObject`SELECT 1 FROM session WHERE id = ${sid}`;
        return rows.length > 0;
    }

    async generatePendingSession(): Promise<Pending> {
        const { rows: [ first, ...rest ] } = await this.#client.queryObject`INSERT INTO pending DEFAULT VALUES`;
        assert(rest.length == 0);
        return PendingSchema.parse(first);
    }
}
