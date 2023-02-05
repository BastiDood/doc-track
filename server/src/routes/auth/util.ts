import { assert } from 'asserts';
import { encode as base64Encode, decode as base64Decode } from 'base64url';
import { decode as hexDecode } from 'hex';

import { HeaderSchema } from '../../model/jwk/header.ts';
import { type IdToken, IdTokenSchema } from '../../model/oauth/openid.ts';
import { KEYS } from '../../model/oauth/openid.ts';

/** Takes a UUID v4 string, applies SHA-256, and returns a URL-safe Base64-encoded hash. */
export async function hashUuid(id: string) {
    // Convert UUID to raw byte representation
    const encoder = new TextEncoder;
    const uuid = hexDecode(encoder.encode(id.replaceAll('-', '')));

    // Hash the bytes using SHA-256
    const buffer = await crypto.subtle.digest('SHA-256', uuid);
    return base64Encode(buffer);
}

/** Parses and validates an ID token as a JSON web token. */
export async function parseJwt(jwt: string): Promise<IdToken> {
    // TODO: add tests
    const [ first, second, signature, ...rest ] = jwt.split('.');
    assert(rest.length === 0 && first && second && signature);

    // Parse the header
    const firstDecoder = new TextDecoder('ascii');
    const { alg, kid } = HeaderSchema.parse(JSON.parse(firstDecoder.decode(base64Decode(first))));
    const algorithm = alg === 'RS256'
        ? { name: 'RSASSA-PKCS1-v1_5' }
        : { name: 'ECDSA', hash: 'SHA-256' };

    const key = KEYS.get(kid);
    assert(key?.algorithm.name === algorithm.name);

    const encoder = new TextEncoder;
    assert(await crypto.subtle.verify(algorithm, key, base64Decode(signature), encoder.encode(`${first}.${second}`)));

    const secondDecoder = new TextDecoder('ascii');
    return IdTokenSchema.parse(JSON.parse(secondDecoder.decode(base64Decode(second))));
}
