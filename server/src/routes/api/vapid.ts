import { Status } from 'http';
import { Pool } from 'postgres';

import { PushSubscriptionJsonSchema } from '~model/subscription.ts';

import { Database } from '../../database.ts';
import { env } from '../../env.ts';

export function handleVapidPublicKey() {
    return new Response(env.VAPID_RAW_PUB_KEY, {
        headers: { 'Content-Type': 'application/octet-stream' },
    });
}

export async function handleSubscribe(pool: Pool, req: Request) {
    // FIXME: Add CSRF tokens and nonces to mitigate replay attacks.
    const sub = PushSubscriptionJsonSchema.parse(await req.json());
    const db = await Database.fromPool(pool);
    try {
        await db.pushSubscription(sub);
        return new Response(null, { status: Status.Created });
    } finally {
        db.release();
    }
}
