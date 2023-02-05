import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';

import { env } from './env.ts';
import { get, post } from './routes/mod.ts';

const pool = new Pool({
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    hostname: env.PG_HOSTNAME,
    port: env.PG_PORT,
    database: env.PG_DATABASE,
}, env.PG_POOL, true);

function handle(req: Request) {
    switch (req.method) {
        case 'GET': return get(pool, req);
        case 'POST': return post(pool, req);
        default:
            error(`[${req.method}] Unsupported Method`);
            return new Response(null, { status: Status.NotImplemented });
    }
}

info('[Server] Initialized');
for await (const conn of Deno.listen({ port: env.PORT })) {
    const { rid, remoteAddr, localAddr } = conn;
    if (remoteAddr.transport !== 'tcp' || localAddr.transport !== 'tcp')
        continue;

    info(`[Connection ${rid}] ${remoteAddr.hostname}:${remoteAddr.port} => ${localAddr.hostname}:${localAddr.port}`);
    for await (const { request, respondWith } of Deno.serveHttp(conn)) {
        info(`[HTTP] ${request.method} ${request.url}`);
        await respondWith(handle(request));
    }
}
