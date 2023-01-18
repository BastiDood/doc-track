import { env } from './env.ts';

function handle(req: Request): Response | Promise<Response> {
    return new Response('Hello world');
}

for await (const conn of Deno.listen({ port: env.PORT }))
    for await (const { request, respondWith } of Deno.serveHttp(conn))
        await respondWith(handle(request));
