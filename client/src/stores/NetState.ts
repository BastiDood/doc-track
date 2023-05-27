import { writable } from '@square/svelte-store';
import { sendNotification } from '../notification.ts';
import { topToastMessage } from './ToastStore.ts';
import { ToastType } from '../components/types.ts';

const { subscribe, set } = writable(navigator.onLine);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
addEventListener('online', async() => {
    set(true);
    await sendNotification('Connection established.', {
        body: 'Queued actions will be pushed.',
        tag: 'net-status',
    });
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
addEventListener('offline', async() => {
    set(false);
    await sendNotification('Connection lost.', {
        body: 'Actions will be queued when the connection returns.',
        tag: 'net-status',
    });
    topToastMessage.enqueue({
        title: 'Currently Offline',
        body: 'Actions will be cached and will be pushed when the connection returns.',
        timeout: 8000,
        type: ToastType.Offline,
    });
});

/**
 * This store contains a boolean value designating the network state of DocTrack
 *
 * # Store Details
 * - `true` => Connection with the server is online.
 * - `false` => Offline otherwise.
 */
export const isOnline = { subscribe };
