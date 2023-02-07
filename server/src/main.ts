import { assert } from 'asserts';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';
import { serveListener } from 'server';

import { env } from './env.ts';
import {
    handleDelete,
    handleGet,
    handlePost,
    handlePut
} from './routes/mod.ts';

const pool = new Pool({
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    hostname: env.PG_HOSTNAME,
    port: env.PG_PORT,
    database: env.PG_DATABASE,
}, env.PG_POOL, true);

function handle(req: Request) {
    switch (req.method) {
        case 'GET': return handleGet(pool, req);
        case 'POST': return handlePost(pool, req);
        case 'PUT': return handlePut(pool, req);
        case 'DELETE': return handleDelete(pool, req);
        default:
            error(`[${req.method}] Unsupported Method`);
            return new Response(null, { status: Status.NotImplemented });
    }
}

const listener = Deno.listen({ port: env.PORT });
assert(listener.addr.transport === 'tcp');
info(`[Server] Initialized at ${listener.addr.hostname}:${listener.addr.port}`);

await serveListener(listener, handle);
await pool.end();
info('[Server] Closed');
