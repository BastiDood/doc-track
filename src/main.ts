import { env } from './env.ts';

for await (const conn of Deno.listen({ port: env.PORT }))
    for await (const evt of Deno.serveHttp(conn))
        evt.respondWith(new Response("Hello World!"));
