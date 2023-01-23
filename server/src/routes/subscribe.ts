import { Status } from 'http';
import { Pool } from 'postgres';

import { Database } from '../database.ts';
import { PushSubscriptionSchema } from '../model/db/subscription.ts';

export async function handleSubscribe(pool: Pool, req: Request) {
    // FIXME: Add CSRF tokens and nonces to mitigate replay attacks.
    const sub = PushSubscriptionSchema.parse(await req.json());
    const db = await Database.fromPool(pool);
    await db.pushSubscription(sub);
    db.release();
    return new Response(null, { status: Status.Created });
}
