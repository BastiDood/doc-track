import { assert } from '../assert';

async function getSubscription(manager: PushManager): Promise<PushSubscription> {
    const maybeSub = await manager.getSubscription();
    if (maybeSub !== null) return maybeSub;

    const sub = await manager.subscribe({
        applicationServerKey: process.env.VAPID_PUB_KEY,
        userVisibleOnly: true,
    });

    const { endpoint, expirationTime, keys } = sub.toJSON();
    assert(endpoint);
    assert(keys);

    const { auth, p256dh } = keys;
    assert(auth);
    assert(p256dh);

    const response = await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({
            endpoint,
            expiration: expirationTime ?? null,
            auth,
            p256dh,
        }),
    });

    if (response.status !== 201)
        throw new Error('failed to submit subscription');

    return sub;
}

export async function register() {
    await navigator.serviceWorker.register(new URL('sw.ts', import.meta.url), { type: 'module' });
    const { pushManager } = await navigator.serviceWorker.ready;
}
