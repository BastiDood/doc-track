import { env } from './env.ts';

function handle(req: Request): Response {
    return new Response('Hello World!');
}

for await (const conn of Deno.listen({ port: env.PORT }))
    for await (const { request, respondWith } of Deno.serveHttp(conn))
        await respondWith(handle(request));
