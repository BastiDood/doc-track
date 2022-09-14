import { env } from './env.ts';

for await (const conn of Deno.listen({ port: env.PORT }))
    for await (const { request, respondWith } of Deno.serveHttp(conn))
        respondWith(new Response("Hello World!"));
