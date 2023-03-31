import { assert } from 'asserts';
import { info } from 'log';
import { Pool } from 'postgres';
import { serveListener } from 'server';

import { env } from './env.ts';
import { handleRequest } from './routes/mod.ts';

const pool = new Pool({
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    hostname: env.PG_HOSTNAME,
    port: env.PG_PORT,
    database: env.PG_DATABASE,
}, env.PG_POOL, true);

const controller = new AbortController();
Deno.addSignalListener('SIGINT', () => controller.abort());

const listener = Deno.listen({ port: env.PORT });
assert(listener.addr.transport === 'tcp');
info(`[Server] Initialized at ${listener.addr.hostname}:${listener.addr.port}`);
await serveListener(listener, handleRequest.bind(null, pool), controller);

await pool.end();
info('[Server] Closed');
