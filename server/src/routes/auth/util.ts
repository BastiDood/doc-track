import { encode } from 'hex';
import { Uuid } from 'uuid';

/** Takes a UUID string and applies SHA-256. */
export async function hashUuid(id: string) {
    // Hash the raw byte representation
    const uuid = new Uuid(id);
    const { buffer } = Uint8Array.from(uuid.toBytes());
    const hashed = await crypto.subtle.digest('SHA-256', buffer);

    // Generate the hex string of the hashed ID
    const hex = encode(new Uint8Array(hashed));
    const decoder = new TextDecoder('ascii', { fatal: true });
    return decoder.decode(hex);
}
