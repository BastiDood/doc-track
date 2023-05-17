// https://web.dev/push-notifications-web-push-protocol/
// https://developer.chrome.com/blog/web-push-encryption/

import { concat } from 'bytes/concat';
import { encode as b64encode } from 'base64url';
import { HOUR } from 'datetime';

import type { PushNotification } from '~model/api.ts';
import type { PushSubscription } from '~model/subscription.ts';

const ECDSA = { name: 'ECDSA', namedCurve: 'P-256' } as const;
const AES_GCM = { name: 'AES-GCM', length: 256 } as const;
const HMAC = { name: 'HMAC', hash: 'SHA-256' } as const;

const enc = new TextEncoder;
const WEB_PUSH_INFO = enc.encode('WebPush: info\u0000');
const CEK_INFO_PREFIX = enc.encode('Content-Encoding: aesgcm\u0000P-256\u0000');
const NONCE_INFO_PREFIX = enc.encode('Content-Encoding: nonce\u0000P-256\u0000');

const JWT_HEADER = JSON.stringify({
    typ: 'JWT',
    alg: 'ES256',
});
const ENCODED_JWT_HEADER = b64encode(enc.encode(JWT_HEADER));

function serializeInt(int: number) {
    const short = new Uint8Array(2);
    const view = new DataView(short);
    view.setInt16(0, int, false);
    return short;
}

function serializeBytes(bytes: Uint8Array) {
    const len = serializeInt(bytes.byteLength);
    return concat(len, bytes);
}

export class WebPush {
    #email: string;
    #encodedVapidPubKey: string;
    #vapidPrvKey: CryptoKey;

    constructor(email: string, rawPubKey: ArrayBuffer, prvKey: CryptoKey) {
        this.#email = email;
        this.#encodedVapidPubKey = b64encode(rawPubKey);
        this.#vapidPrvKey = prvKey;
    }

    async #generateAuthorizationJwt({ origin }: URL) {
        // Create the payload
        const expiration = Date.now() + 12 * HOUR;
        const payload = JSON.stringify({
            aud: origin,
            sub: this.#email,
            exp: Math.floor(expiration / 1e3),
        });

        // Sign the payload
        const encodedPayload = b64encode(enc.encode(payload))
        const token = `${ENCODED_JWT_HEADER}.${encodedPayload}`;
        const signature = await crypto.subtle.sign('HMAC', this.#vapidPrvKey, enc.encode(token));
        return `WebPush ${token}.${signature}`;
    }

    /** Implements Section 3.4 of RFC 8291 (Message Encryption for Web Push). */
    async createPushPayload({ endpoint, auth, p256dh }: Omit<PushSubscription, 'expiration'>, payload: PushNotification) {
        // Compute the shared secret from the client's public key and the server's (newly generated) private key
        const { privateKey: localPrivateKey, publicKey: localPublicKey } = await crypto.subtle.generateKey(ECDSA, true, [ 'deriveKey' ]);
        const clientPublicKey = await crypto.subtle.importKey('raw', p256dh, HMAC, false, [ 'deriveKey' ]);
        const sharedSecret = await crypto.subtle.deriveKey({ name: 'ECDH', public: clientPublicKey }, localPrivateKey, AES_GCM, true, [ 'encrypt' ]);
        const rawSharedSecret = await crypto.subtle.exportKey('raw', sharedSecret);

        // HKDF-Extract(authKey, sharedSecret)
        const authSecret = await crypto.subtle.importKey('raw', auth, HMAC, false, [ 'sign' ]);
        const rawPrkKey = await crypto.subtle.sign('HMAC', authSecret, rawSharedSecret);
        const prkKey = await crypto.subtle.importKey('raw', rawPrkKey, HMAC, false, [ 'sign' ]);

        // HKDF-Expand(prkKey, keyInfo, 32)
        const rawLocalPublicKey = await crypto.subtle.exportKey('raw', localPublicKey);
        const keyInfo = concat(WEB_PUSH_INFO, p256dh, new Uint8Array(rawLocalPublicKey), Uint8Array.of(1));
        const rawIkm = await crypto.subtle.sign('HMAC', prkKey, keyInfo);

        // HKDF-Extract(salt, ikm)
        const rawSalt = crypto.getRandomValues(new Uint8Array(16));
        const salt = await crypto.subtle.importKey('raw', rawSalt, HMAC, false, [ 'sign' ]);
        const rawPrk = await crypto.subtle.sign('HMAC', salt, rawIkm);
        const prk = await crypto.subtle.importKey('raw', rawPrk, HMAC, false, [ 'sign' ]);

        // Information suffix or "context" in some references
        // (receiver length | receiver bytes | sender length | sender bytes)
        const context = concat(serializeBytes(p256dh), new Uint8Array(rawLocalPublicKey));
        const [ rawCek, rawNonce ] = await Promise.all([
            // HKDF-Expand(prk, cekInfo, 16)
            crypto.subtle.sign('HMAC', prk, concat(CEK_INFO_PREFIX, context)),
            // HKDF-Expand(prk, nonceInfo, 12)
            crypto.subtle.sign('HMAC', prk, concat(NONCE_INFO_PREFIX, context)),
        ]);

        // TODO: add padding before the payload
        // Construct the final payload
        const final = concat(new Uint8Array(2), enc.encode(JSON.stringify(payload)));

        // Finally encrypt the payload with the strengthened content encryption key (CEK)
        const cek = await crypto.subtle.importKey('raw', rawCek.slice(0, 16), 'AES-GCM', false, [ 'encrypt' ]);
        const rawBody = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: rawNonce.slice(0, 12) }, cek, final);

        return new Request(endpoint, {
            method: 'POST',
            body: rawBody,
            headers: {
                'Authorization': await this.#generateAuthorizationJwt(new URL(endpoint)),
                'Content-Encoding': 'aesgcm',
                'Content-Length': rawBody.byteLength.toString(),
                'Content-Type': 'application/octet-stream',
                'Crypto-Key': `dh=${b64encode(rawLocalPublicKey)}; p256ecdsa=${this.#encodedVapidPubKey}`,
                'Encryption': `salt=${b64encode(rawSalt)}`,
                'TTL': '10', // arbitrarily selected
            },
        });
    }
}
