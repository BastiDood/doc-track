import { env } from './env.ts';
import { Status } from './deps.ts';
import { PushSubscriptionSchema } from './model/subscription.ts';

async function handle(req: Request): Promise<Response> {
    if (req.method !== 'POST')
        return new Response(null, { status: Status.MethodNotAllowed });

    const json = await req.json();
    const { endpoint, expirationTime } = PushSubscriptionSchema.parse(json);
    // TODO: Store endpoint details to database.

    return new Response(null, { status: Status.Created });
}

for await (const conn of Deno.listen({ port: env.PORT }))
    for await (const { request, respondWith } of Deno.serveHttp(conn))
        await respondWith(handle(request));
