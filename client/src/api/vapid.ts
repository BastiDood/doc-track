import { assert } from '../assert';

export namespace Vapid {
    export async function getVapidPublicKey(): Promise<ArrayBuffer | null> {
        const res = await fetch('/api/vapid', { headers: { 'Accept': 'application/octet-stream' } });
        return res.status === 200 ? res.arrayBuffer() : null;
    }

    export async function sendSubscription({ endpoint, expirationTime, keys }: PushSubscriptionJSON): Promise<boolean> {
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
        return res.status === 201;
    }
}
