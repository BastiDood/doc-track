import { assert } from 'asserts';
import { z } from 'zod';

import { env } from '../../env.ts';

const DiscoveryDocumentSchema = z.object({
    issuer: z.string().url(),
    authorization_endpoint: z.string().url(),
    token_endpoint: z.string().url(),
    userinfo_endpoint: z.string().url(),
    revocation_endpoint: z.string().url(),
    jwks_uri: z.string().url(),
});

const DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration';

async function loadDiscoveryDocument(name: string) {
    const cache = await caches.open(name);
    const maybeResponse = await cache.match(DISCOVERY_URL);

    // Check cached value first
    if (maybeResponse !== undefined) {
        const expires = maybeResponse.headers.get('Expires');
        assert(expires);
        if (new Date < new Date(expires)) {
            const json = await maybeResponse.json();
            return DiscoveryDocumentSchema.parse(json);
        }
    }

    // Otherwise fetch a new copy
    const response = await fetch(DISCOVERY_URL);
    assert(response.ok);
    const clone = response.clone();
    const json = DiscoveryDocumentSchema.parse(await response.json());
    await cache.put(DISCOVERY_URL, clone);
    return json;
}

export const DISCOVERY = await loadDiscoveryDocument('discoery');

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
