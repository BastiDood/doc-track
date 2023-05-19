import { assert } from '../assert.ts';
import { Vapid } from '../api/vapid.ts';

export async function getSubscription(manager: PushManager): Promise<PushSubscription> {
    const maybeSub = await manager.getSubscription();
    if (maybeSub !== null) return maybeSub;
    return manager.subscribe({
        applicationServerKey: await Vapid.getVapidPublicKey(),
        userVisibleOnly: true,
    });
}

export function register() {
    return navigator.serviceWorker.register(new URL('sw.ts', import.meta.url), {
        type: 'module',
        scope: '/',
    });
}
