import { Client, type ClientOptions } from '../deps.ts';

export class Database {
    #client: Client;

    private constructor(client: Client) { this.#client = client }

    async create(options: ClientOptions) {
        const client = new Client(options);
        await client.connect();
        return new Database(client);
    }

    end() { return this.#client.end(); }
}
