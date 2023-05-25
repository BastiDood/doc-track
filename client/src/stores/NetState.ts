import { writable } from '@square/svelte-store';
import { sendNotification } from '../notification.ts';

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
});

/**
 * This store contains a boolean value designating the network state of DocTrack
 *
 * # Store Details
 * - `true` => Connection with the server is online.
 * - `false` => Offline otherwise.
 */
export const isOnline = { subscribe };
