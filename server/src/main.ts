import { Status } from 'http';
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
        case 'POST': return post(req);
        default: return new Response(null, { status: Status.NotImplemented });
    }
}

for await (const conn of Deno.listen({ port: env.PORT }))
    for await (const { request, respondWith } of Deno.serveHttp(conn))
        await respondWith(handle(request));
