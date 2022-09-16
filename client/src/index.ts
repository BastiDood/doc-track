import App from './App.svelte';
import { assert } from './assert';

async function getSubscription(manager: PushManager): Promise<PushSubscription> {
    const maybeSub = await manager.getSubscription();
    if (maybeSub !== null) return maybeSub;

    const sub = await manager.subscribe({
        applicationServerKey: process.env.VAPID_PUB_KEY,
        userVisibleOnly: true,
    });

    const body = JSON.stringify(sub.toJSON());
    const response = await fetch(process.env.SUBSCRIBE_URL, { method: 'POST', body });
    if (response.status !== 201) throw new Error('failed to submit subscription');

    // TODO: Prompt user that they have been successfully registered.

    return sub;
}

async function main() {
    const { pushManager } = await navigator.serviceWorker.register(new URL('sw.ts', import.meta.url), { type: 'module' });
    const { expirationTime } = await getSubscription(pushManager);
    assert(expirationTime !== null);

    const date = new Date(expirationTime);
    console.log(`subscription expires at ${date}`);
}

main();

const app = new App({ target: document.body });
export default app;
