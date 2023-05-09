import { manifest, version } from '@parcel/service-worker';

import localForage from 'localforage';
import { assert } from '../assert.ts';
import { DeferredFetch } from './syncman.ts';
import { SnapshotSchema, Status } from '../../../model/src/snapshot.ts';
import { deferredSnaps } from './dashboard/stores/DeferredStore.ts';
import { DocumentSchema } from '../../../model/src/document.ts';

async function handleInstall() {
    const INDEX = '/index.html';
    const files = manifest.map(path => {
        if (!path.endsWith(INDEX)) return path;
        return path.slice(0, -INDEX.length) || '/';
    });

    // Pre-cache all the new assets
    const cache = await caches.open(version);
    assert(self.registration.sync);
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
    const promises = (await localForage.keys()).map(async key => {
        const defer: DeferredFetch | null = await localForage.getItem(key);
        assert(defer !== null);
        return fetch(defer.url, {
            credentials: defer.credentials,
            method: defer.method,
            body: JSON.stringify(defer.body),
            headers: defer.headers,
        });
    });

    // Clear storage and reset deferredSnaps store if all entries pushed.
    await localForage.clear();
    deferredSnaps.reset?.();

    // Toss all to the server
    return Promise.allSettled(promises);

    //TODO: Error handler when atleast one fails.
    //TODO: UI facing indicator of entries being pushed.
}

async function handleDocumentPost(req: Request): Promise<Response> {
    try {
        const res = await fetch(req.clone());

        // If you reach this point without throwing an error, you are probably online.
        if ((await self.registration.sync.getTags()).length !== 0)
            // Go and push the entries if there is at least one registered sync event.
            await pushEntriesToServer();
        return res;
    } catch (error) {
        // Threw an error, you are probably offline.
        assert(error instanceof TypeError);

        const url = new URL(req.url);
        let key: string;
        let stat: Status;

        // Extract document information and status from json body.
        if (url.pathname.startsWith('/api/snapshot')) {
            // Insert snapshot schema uses doc as barcode id.
            const { doc, status } = SnapshotSchema.pick({ doc: true , status: true}).parse(await req.clone().json());
            key = doc;
            stat = status
        } else {
            // Registration uses id to hold barcode id. It dosen't have a status either.
            const { id } = DocumentSchema.pick({ id: true }).parse(await req.clone().json());
            key = id;
            stat = Status.Register;
        }
        
        // Request a background sync by assigning a tag.
        await requestBackgroundSync(key);

        // Copy the failed request's structure
        const payload: unknown = await req.json();
        const defer = {
            credentials: req.credentials,
            url: req.url,
            method: req.method,
            headers: [...req.headers],
            body: payload,
        } as DeferredFetch;

        // Load the item into local storage, with barcode as the primary key.
        await localForage.setItem(key, defer)

        // Update snaps store.
        deferredSnaps.update(snaps => {
            return [...snaps, {status: stat, doc: key}]})

        // Return sentinel response.
        return new Response(null, { status: 503 });
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
    // TODO
}, { passive: true });

self.addEventListener('sync', evt => {
    // A sync event is triggered when the service worker detects internet connectivity.
    assert(evt instanceof SyncEvent);
    evt.waitUntil(pushEntriesToServer());
}, { passive: true });

