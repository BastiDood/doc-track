import { getSetCookies } from 'cookie';
import { Pool } from 'postgres';

import { env } from '~server/env.ts';
import { handleRequest } from '~server/routes/mod.ts'

Deno.test('full API integration test', () => {
    const pool = new Pool({
        user: env.PG_USER,
        password: env.PG_PASSWORD,
        hostname: env.PG_HOSTNAME,
        port: env.PORT,
        database: env.PG_DATABASE,
    }, 1, false);

    // Mock the `fetch` function and its cookie store
    const origFetch = globalThis.fetch;
    const cookies = new Map<string, string>;
    globalThis.fetch = async (input: URL | RequestInfo, init?: RequestInit) => {
        const res = await handleRequest(pool, new Request(input, init));
        for (const { name, value } of getSetCookies(res.headers))
            cookies.set(name, value);
        return res;
    };

    // Restore the original fetch
    globalThis.fetch = origFetch;
});
