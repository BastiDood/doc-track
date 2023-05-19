import { Status } from 'http';
import { error, info, warning } from 'log';
import { parseMediaType } from 'parse-media-type';
import { Pool } from 'postgres';

import { DocumentSchema } from '~model/document.ts';
import { PushSubscriptionJsonSchema } from '~model/subscription.ts';

import { Database } from '../../database.ts';
import { env } from '../../env.ts';

export function handleVapidPublicKey() {
    info('[VAPID] Public key has been requested');
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
        info(`[VAPID] Push notification endpoint ${sub.endpoint} submitted`);
        return new Response(null, { status: Status.Created });
    } finally {
        db.release();
    }
}

export async function handleHook(pool: Pool, req: Request, params: URLSearchParams) {
    const ct = req.headers.get('Content-Type');
    if (!ct) {
        error(`[VAPID] Content negotiation failed`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct);
    if (mime !== 'text/plain') {
        error(`[VAPID] Content negotiation failed`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const didResult = DocumentSchema.shape.id.safeParse(params.get('doc'));
    if (!didResult.success) {
        error('[VAPID] User provided an invalid document ID');
        return new Response(null, { status: Status.BadRequest });
    }

    const endpointResult = PushSubscriptionJsonSchema.shape.endpoint.safeParse(await req.text());
    if (!endpointResult.success) {
        error('[VAPID] User provided an invalid endpoint');
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const sub = endpointResult.data;
        const doc = didResult.data;
        if (await db.hookSubscription(sub, doc))
            info(`[VAPID] New subscription for document ${doc} from ${sub}`);
        else
            warning(`[VAPID] Resubscribed ${sub} for document ${doc}`);
        return new Response(null, { status: Status.Created });
    } finally {
        db.release();
    }
}
