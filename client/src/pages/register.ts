import { assert } from '../assert';
import { Vapid } from '../api/vapid';

async function getSubscription(manager: PushManager): Promise<PushSubscription> {
    const maybeSub = await manager.getSubscription();
    if (maybeSub !== null) return maybeSub;

    const applicationServerKey = await Vapid.getVapidPublicKey();
    assert(applicationServerKey !== null);
    const sub = await manager.subscribe({
        applicationServerKey,
        userVisibleOnly: true,
    });

    assert(await Vapid.sendSubscription(sub.toJSON()));
    return sub;
}

export async function register() {
    await navigator.serviceWorker.register(new URL('sw.ts', import.meta.url), { type: 'module' });
    const { pushManager } = await navigator.serviceWorker.ready;
}
