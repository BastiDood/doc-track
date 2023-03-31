import { manifest, version } from '@parcel/service-worker';

import { assert } from '../assert.ts';

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
