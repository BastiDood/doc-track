import { Status } from 'http';

import { env } from './env.ts';
import { get, post } from './routes/mod.ts';

function handle(req: Request): Promise<Response> {
    switch (req.method) {
        case 'GET': return Promise.resolve(get(req));
        case 'POST': return post(req);
    }
    return Promise.resolve(new Response(null, { status: Status.Created }));
}

for await (const conn of Deno.listen({ port: env.PORT }))
    for await (const { request, respondWith } of Deno.serveHttp(conn))
        await respondWith(handle(request));
