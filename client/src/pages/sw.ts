import { manifest, version } from '@parcel/service-worker';
import localForage from 'localforage';
import { StatusCodes } from 'http-status-codes';

import { type DeferredFetch, DeferredFetchSchema } from './syncman.ts';
import { assert } from '../assert.ts';

import { DeferredRegistrationSchema, DeferredSnapshotSchema, PushNotificationSchema } from '../../../model/src/api.ts';
import { Status } from '../../../model/src/snapshot.ts';

assert(self.registration.sync);

async function handleInstall() {
    const INDEX = '/index.html';
    const files = manifest.map(path => {
        if (!path.endsWith(INDEX)) return path;
        return path.slice(0, -INDEX.length) || '/';
    });

    // Pre-cache all the new assets
    const cache = await caches.open(version);
    return cache.addAll(files);
}

function* deleteAll(keys: Iterable<string>) {
    // Remove all caches except our current version
    for (const key of keys)
        if (key !== version)
            yield caches.delete(key);
}

async function requestBackgroundSync(ty: string) {
    // We are offline, set a tag to insert snapshot.
    await self.registration.sync.register(ty);
    const tag = await self.registration.sync.getTags();
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

async function handleDocumentPost(req: Request): Promise<Response> {
    try {
        const res = await fetch(req.clone());
        return res;
    } catch (error) {
        // Threw an error, you are probably offline.
        assert(error instanceof TypeError);

        // Extract document information and status from json body.
        const { pathname } = new URL(req.url);
        const json: unknown = await req.clone().json();
        const key = pathname.startsWith('/api/snapshot')
            ? DeferredSnapshotSchema.parse(json).doc
            : DeferredRegistrationSchema.parse(json).id;

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
        if (url.pathname.startsWith('/api/') || url.hostname.endsWith('googleusercontent.com'))
            await cache.put(url, res.clone());
        return res;
    } catch (error) {
        assert(error instanceof TypeError);
        const maybeRes = await cache.match(req);
        assert(maybeRes instanceof Response);
        return maybeRes;
    }
}

async function handlePush(data: PushMessageData) {
    const json = await data.json();
    const { title, creation, eval: staff, target, status } = PushNotificationSchema.parse(json);
    const timestamp = creation.valueOf();
    switch (status) {
        case Status.Register:
            registration.showNotification('New Document Registered', {
                body: `${staff} has created a new document "${title}" for "${target}".`,
                timestamp,
            });
            break;
        case Status.Send:
            registration.showNotification('Document Sent', {
                body: `${staff} has sent "${title}" to "${target}".`,
                timestamp,
            });
            break;
        case Status.Receive:
            registration.showNotification('Document Received', {
                body: `${staff} has received "${title}" on behalf of "${target}".`,
                timestamp,
            });
            break;
        case Status.Terminate:
            registration.showNotification('Document Terminated', {
                body: `${staff} has terminated the paper trail for "${title}" at "${target}".`,
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

