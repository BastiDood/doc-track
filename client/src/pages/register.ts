async function getSubscription(manager: PushManager): Promise<PushSubscription> {
    const maybeSub = await manager.getSubscription();
    if (maybeSub !== null) return maybeSub;

    const sub = await manager.subscribe({
        applicationServerKey: process.env.VAPID_PUB_KEY,
        userVisibleOnly: true,
    });

    const body = JSON.stringify(sub.toJSON());
    const response = await fetch('/api/subscribe', { method: 'POST', body });
    if (response.status !== 201) throw new Error('failed to submit subscription');
    return sub;
}

export async function register() {
    await navigator.serviceWorker.register(new URL('sw.ts', import.meta.url), { type: 'module' });
    const { pushManager } = await navigator.serviceWorker.ready;
}
