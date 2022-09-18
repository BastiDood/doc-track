import { Status } from "../deps.ts";
import { PushSubscriptionSchema } from "../model/subscription.ts";

export function get(req: Request): Response {
    return new Response('Hello world!');
}

export async function post(req: Request): Promise<Response> {
    const { pathname } = new URL(req.url);
    if (pathname !== '/push') return new Response(null, { status: Status.NotFound });

    const json = await req.json();
    const { endpoint, expirationTime } = PushSubscriptionSchema.parse(json);
    // TODO: Store endpoint details to database.

    return new Response(null, { status: Status.Created });
}
