import { writable } from '@square/svelte-store';
import { sendNotification } from '../../../notification';

const { subscribe, set } = writable(navigator.onLine);

addEventListener('online', async () => {
    set(true);
    await sendNotification("Connection established.", {
        body: "Queued actions will be pushed.",
        tag: 'net-status',
    })
});
addEventListener('offline', async () => {
    set(false);
    await sendNotification("Connection lost.", {
        body: "Actions will be queued when the connection returns.",
        tag: "net-status",
    });
});

export const isOnline = { subscribe };