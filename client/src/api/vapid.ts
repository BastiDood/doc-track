import { OK, CREATED } from 'http-status';

import { UnexpectedStatusCode } from './error.ts';
import { assert } from '../assert.ts';

export namespace Vapid {
    /** @returns VAPID public key of the server as raw bytes */
    export async function getVapidPublicKey(): Promise<ArrayBuffer> {
        const res = await fetch('/api/vapid', { headers: { 'Accept': 'application/octet-stream' } });
        if (res.status === OK) return res.arrayBuffer();
        throw new UnexpectedStatusCode;
    }

    /** Registers a push subscription to the server (for later use). */
    export async function sendSubscription({ endpoint, expirationTime, keys }: PushSubscriptionJSON) {
        const auth = keys?.auth;
        assert(auth);

        const p256dh = keys.p256dh;
        assert(p256dh);

        const res = await fetch('/api/vapid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint,
                expiration: expirationTime,
                auth,
                p256dh,
            }),
        });

        if (res.status === CREATED) return;
        throw new UnexpectedStatusCode;
    }
}
