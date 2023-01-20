import { encode } from 'base64url';
import { decode } from 'hex';

/** Takes a UUID v4 string, applies SHA-256, and returns a URL-safe Base64-encoded hash. */
export async function hashUuid(id: string) {
    // Convert UUID to raw byte representation
    const encoder = new TextEncoder;
    const uuid = decode(encoder.encode(id.replaceAll('-', '')));

    // Hash the bytes using SHA-256
    const buffer = await crypto.subtle.digest('SHA-256', uuid);
    return encode(buffer);
}
