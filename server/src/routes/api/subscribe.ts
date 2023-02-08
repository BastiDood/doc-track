import { Status } from 'http';
import { Pool } from 'postgres';

import { Database } from '../../database.ts';
import { PushSubscriptionJsonSchema } from '../../model/db/subscription.ts';

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
