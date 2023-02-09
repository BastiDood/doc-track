import { assert } from 'asserts';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';
import { serveListener } from 'server';

import { env } from './env.ts';
import {
    handleDelete,
    handleGet,
    handlePatch,
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

function route(method: string) {
    switch (method) {
        case 'GET': return handleGet;
        case 'POST': return handlePost;
        case 'PUT': return handlePut;
        case 'DELETE': return handleDelete;
        case 'PATCH': return handlePatch;
        default: return null;
    }
}

const controller = new AbortController();
Deno.addSignalListener('SIGINT', () => controller.abort());

const listener = Deno.listen({ port: env.PORT });
assert(listener.addr.transport === 'tcp');
info(`[Server] Initialized at ${listener.addr.hostname}:${listener.addr.port}`);

await serveListener(listener, req => {
    const handler = route(req.method);
    if (handler !== null) return handler(pool, req);
    error(`[${req.method}] Unsupported`);
    return new Response(null, { status: Status.NotImplemented });
}, { signal: controller.signal });

await pool.end();
info('[Server] Closed');
