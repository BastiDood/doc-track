import { assert } from 'asserts';
import { info, warning } from 'log';
import { z } from 'zod';

import { env } from '../../env.ts';
import { KeySchema } from '../jwk/key.ts';

const DiscoveryDocumentSchema = z.object({
    issuer: z.string().url(),
    authorization_endpoint: z.string().url(),
    token_endpoint: z.string().url(),
    userinfo_endpoint: z.string().url(),
    revocation_endpoint: z.string().url(),
    jwks_uri: z.string().url(),
});

const DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration';

async function loadCachedResource<T>(name: string, url: string, schema: z.ZodType<T>): Promise<T> {
    const cache = await caches.open(name);
    const maybeResponse = await cache.match(url);

    // Check cached value first
    if (maybeResponse !== undefined) {
        info(`[Cache ${name}] Hit ${url}`);
        const expires = maybeResponse.headers.get('Expires');
        assert(expires);

        const expiration = new Date(expires);
        info(`[Cache ${name}] Cached response expires at ${expiration.toLocaleString()}`)

        if (new Date < expiration) {
            info(`[Cache ${name}] Using ${url}`);
            const json = await maybeResponse.json();
            return schema.parse(json);
        }

        assert(await cache.delete(url));
        warning(`[Cache ${name}] Busting ${url}`);
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

export const DISCOVERY = await loadCachedResource('discovery', DISCOVERY_URL, DiscoveryDocumentSchema);
info('[Discovery] Initialized');

const { keys } = await loadCachedResource('certs', DISCOVERY.jwks_uri, z.object({ keys: KeySchema.passthrough().array() }));
info('[Certs] Initialized');

const map = new Map<string, CryptoKey>();
for (const jwk of keys) {
    const options = jwk.alg === 'RS256'
        ? { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
        : { name: 'ECDSA', namedCurve: 'P-256' };
    const key = await crypto.subtle.importKey('jwk', jwk, options, false, [ 'verify' ]);
    map.set(jwk.kid, key);
}

export const KEYS = map;

const UNIX_TIME_SECS = z.number().int().transform(secs => new Date(secs * 1000));

export const GoogleUserId = z.string().min(1).max(255);

export const IdTokenSchema = z.object({
    // OpenID audience.
    aud: z.literal(env.GOOGLE_ID),
    // OpenID subject. Typically the globally unique Google user ID.
    sub: GoogleUserId,
    // Creation time (in seconds).
    iat: UNIX_TIME_SECS,
    // Expiration time (in seconds) on or after which the token is invalid.
    exp: UNIX_TIME_SECS,
    // OpenID issuer.
    iss: z.literal(DISCOVERY.issuer),
    // OpenID authorized presenter.
    azp: z.string().min(1),
    // Access token hash.
    at_hash: z.string().min(1),
    email: z.string().email(),
    email_verified: z.boolean(),
    name: z.string().min(1),
    hd: z.literal(env.HOSTED_GSUITE_DOMAIN),
    nonce: z.string().min(1),
    picture: z.string().url(),
});

export type IdToken = z.infer<typeof IdTokenSchema>;
