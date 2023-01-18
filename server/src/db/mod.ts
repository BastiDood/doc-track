import { assert } from 'asserts';
import { Client, type ClientOptions } from 'postgres';

import { PendingSchema, type Pending } from '../model/pending.ts';

export class Database {
    #client: Client;

    private constructor(client: Client) { this.#client = client }

    async create(options: ClientOptions) {
        const client = new Client(options);
        await client.connect();
        return new Database(client);
    }

    end() { return this.#client.end(); }

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
