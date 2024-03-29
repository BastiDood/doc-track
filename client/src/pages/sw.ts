import { manifest, version } from '@parcel/service-worker';
import localForage from 'localforage';
import { StatusCodes } from 'http-status-codes';

import { type DeferredFetch, DeferredFetchSchema } from './syncman.ts';
import { assert } from '../assert.ts';

import { DeferredRegistrationSchema, DeferredSnapshotSchema, PushNotificationSchema } from '../../../model/src/api.ts';
import { Status } from '../../../model/src/snapshot.ts';

async function handleInstall() {
    const INDEX = '/index.html';
    const files = manifest.map(path => {
        if (path.endsWith(INDEX))
            return path.slice(0, -INDEX.length) || '/';
        return path;
    });

    // Pre-cache all the new assets
    const cache = await caches.open(version);
    const unique = new Set(files);
    return cache.addAll(Array.from(unique));
}

function* deleteAll(keys: Iterable<string>) {
    // Remove all caches except our current version
    for (const key of keys)
        if (key !== version)
            yield caches.delete(key);
}

async function requestBackgroundSync(ty: string) {
    // We are offline, set a tag to insert snapshot.
    await registration.sync.register(ty);
    const tag = await registration.sync.getTags();
    assert(tag.includes(ty));
}

async function pushEntriesToServer() {
    // Load up all entries in localForage and create an array of promises that we will push to the server.
    const keys = await localForage.keys();
    const promises = keys.map(async key => {
        const defer = DeferredFetchSchema.parse(await localForage.getItem(key));
        return fetch(defer.url, {
            credentials: defer.credentials as RequestCredentials,
            method: defer.method,
            body: defer.body,
            headers: defer.headers as HeadersInit,
        });
    });

    // Clear storage and reset deferredSnaps store if all entries pushed.
    await localForage.clear();

    // Toss all to the server
    const client = await self.clients.matchAll();
    client.forEach(client => client.postMessage('sync'));
    return Promise.allSettled(promises);

    // TODO: Error handler when atleast one fails.
    // TODO: UI facing indicator of entries being pushed.
}

async function formDataExtractorId(req: Request) {
    const formData = await req.formData();
    return DeferredRegistrationSchema.shape.id.parse(formData.get('id'));
}

async function handleDocumentPost(req: Request): Promise<Response> {
    try {
        const res = await fetch(req.clone());
        return res;
    } catch (error) {
        // Threw an error, you are probably offline.
        assert(error instanceof TypeError);

        // Extract document information and status from json body.
        const { pathname } = new URL(req.url);
        const cloned = req.clone();
        const key = pathname.startsWith('/api/snapshot')
            ? DeferredSnapshotSchema.parse(await cloned.json()).doc
            : await formDataExtractorId(cloned);

        // Request a background sync by assigning a tag.
        await requestBackgroundSync(key);

        // Load the item into local storage, with barcode as the primary key.
        await localForage.setItem(key, {
            credentials: req.credentials,
            url: req.url,
            method: req.method,
            headers: [...req.headers],
            body: await req.text(),
        } satisfies DeferredFetch);

        // Return sentinel response.
        return new Response(null , { status: StatusCodes.SERVICE_UNAVAILABLE });
    }
}

async function handleActivate() {
    // Delete old cache if we're a new version
    const keys = await caches.keys();
    const results = await Promise.all(deleteAll(keys));
    assert(results.every(x => x));
}

async function handleFetch(req: Request): Promise<Response> {
    // For endpoints with API, attempt internet endpoint but if too long, fetch from cache.
    // If already pre-cached, serve it. Otherwise, fetch the network.
    const cache = await caches.open(version);
    const url = new URL(req.url);

    // Check first if the fetch request is a POST request.
    if (req.method === 'POST' && (url.pathname.startsWith('/api/document') || url.pathname.startsWith('/api/snapshot')))
        return handleDocumentPost(req);

    // For any other fetch.
    try {
        const res = await fetch(req);
        if ((url.pathname.startsWith('/api/') || url.hostname.endsWith('googleusercontent.com')) && !url.pathname.startsWith('/api/document/download'))
            await cache.put(url, res.clone());
        return res;
    } catch (error) {
        assert(error instanceof TypeError);
        const maybeRes = await cache.match(req);
        return maybeRes instanceof Response
            ? maybeRes
            : new Response(null, { status: StatusCodes.SERVICE_UNAVAILABLE });
    }
}

const { href: ICON_URL } = new URL('../assets/logo/DocTrack-256x256.png', import.meta.url);
async function handlePush(data: PushMessageData) {
    const { title, creation, eval: staff, target, status } = PushNotificationSchema.parse(await data.json());
    const timestamp = creation.valueOf();
    const office = target ?? 'No Office';
    switch (status) {
        case Status.Register:
            await registration.showNotification('New Document Registered', {
                lang: 'EN',
                icon: ICON_URL,
                body: `${staff} has created a new document "${title}" for "${office}".`,
                timestamp,
            });
            break;
        case Status.Send:
            await registration.showNotification('Document Sent', {
                lang: 'EN',
                icon: ICON_URL,
                body: `${staff} has sent "${title}" to "${office}".`,
                timestamp,
            });
            break;
        case Status.Receive:
            await registration.showNotification('Document Received', {
                lang: 'EN',
                icon: ICON_URL,
                body: `${staff} has received "${title}" on behalf of "${office}".`,
                timestamp,
            });
            break;
        case Status.Terminate:
            await registration.showNotification('Document Terminated', {
                lang: 'EN',
                icon: ICON_URL,
                body: `${staff} has terminated the paper trail for "${title}" at "${office}".`,
                timestamp,
            });
            break;
        default: throw new Error('unknown status');
    }
}

self.addEventListener('install', evt => {
    assert(evt instanceof ExtendableEvent);
    evt.waitUntil(handleInstall());
}, { once: true, passive: true });

self.addEventListener('activate', evt => {
    assert(evt instanceof ExtendableEvent);
    evt.waitUntil(handleActivate());
}, { once: true, passive: true });

self.addEventListener('fetch', evt => {
    assert(evt instanceof FetchEvent);

    // HACK: Exception for `/auth/callback`
    const url = new URL(evt.request.url);
    if (url.pathname === '/auth/callback') return;

    evt.respondWith(handleFetch(evt.request));
}, { passive: true });

self.addEventListener('push', evt => {
    assert(evt instanceof PushEvent);
    const { data } = evt;
    assert(data !== null);
    evt.waitUntil(handlePush(data));
}, { passive: true });

self.addEventListener('sync', evt => {
    // A sync event is triggered when the service worker detects internet connectivity.
    assert(evt instanceof SyncEvent);
    evt.waitUntil(pushEntriesToServer());
}, { passive: true });

