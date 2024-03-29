import { z } from 'zod';

import { env } from '../../env.ts';
import { getDiscoveryDocument } from '../../cache.ts';

const UNIX_TIME_SECS = z.number().int().transform(secs => new Date(secs * 1000));

export const GoogleUserId = z.string().min(1).max(255);

const { issuer } = await getDiscoveryDocument();
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
    iss: z.literal(issuer),
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
