import { assert } from './assert';
import { manifest, version } from '@parcel/service-worker';

async function handleInstall() {
    // Pre-cache all the new assets
    const cache = await caches.open(version);
    return cache.addAll(manifest);
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
    // If already pre-cached, serve it. Otherwise, fetch the network.
    const maybeRes = await caches.match(req);
    return maybeRes ?? fetch(req);
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
    evt.respondWith(handleFetch(evt.request));
}, { passive: true });

self.addEventListener('push', evt => {
    assert(evt instanceof PushEvent);
    // TODO
}, { passive: true });
