import { assert } from 'asserts';
import { debug, info, warning } from 'log';
import { z } from 'zod';

import { KeySchema } from './model/jwk/key.ts';

async function loadCachedResource<T>(name: string, url: string, schema: z.ZodType<T>): Promise<T> {
    const cache = await caches.open(name);
    const maybeResponse = await cache.match(url);

    // Check cached value first
    if (maybeResponse !== undefined) {
        info(`[Cache] Cache "${name}" hit ${url}`);
        const expires = maybeResponse.headers.get('Expires');
        assert(expires);

        const expiration = new Date(expires);
        info(`[Cache] Cached response for "${name}" expires at ${expiration.toLocaleString()}`)

        if (new Date < expiration) {
            debug(`[Cache ${name}] Using ${url}`);
            const json = await maybeResponse.json();
            return schema.parse(json);
        }

        assert(await cache.delete(url));
        warning(`[Cache] Cache "${name}" busted ${url}`);
    }

    // Otherwise fetch a new copy
    info(`[Cache] Fetching ${url}`);
    const response = await fetch(url);
    assert(response.ok);
    const clone = response.clone();
    const json = schema.parse(await response.json());
    await cache.put(url, clone);
    return json;
}

async function loadCachedResourceWrapper<T>(name: string, url: string, schema: z.ZodType<T>): Promise<T> {
    try {
        const data = await loadCachedResource(name, url, schema);
        info('Cache API detected');
        return data;
    } catch (err) {
        assert(err instanceof ReferenceError);
        const res = await fetch(url);
        const json = await res.json();
        return schema.parse(json);
    }
}

const DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration';
const DiscoveryDocumentSchema = z.object({
    issuer: z.string().url(),
    authorization_endpoint: z.string().url(),
    token_endpoint: z.string().url(),
    userinfo_endpoint: z.string().url(),
    revocation_endpoint: z.string().url(),
    jwks_uri: z.string().url(),
});
export function getDiscoveryDocument() {
    return loadCachedResourceWrapper('discovery', DISCOVERY_URL, DiscoveryDocumentSchema);
}

const CertsResponse = z.object({ keys: KeySchema.passthrough().array() });
export async function getCerts() {
    const { jwks_uri } = await getDiscoveryDocument();
    const { keys } = await loadCachedResourceWrapper('certs', jwks_uri, CertsResponse);
    const map = new Map<string, CryptoKey>();
    for (const jwk of keys) {
        const options = jwk.alg === 'RS256'
            ? { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
            : { name: 'ECDSA', namedCurve: 'P-256' };
        const key = await crypto.subtle.importKey('jwk', jwk, options, false, [ 'verify' ]);
        map.set(jwk.kid, key);
    }
    return map;
}
