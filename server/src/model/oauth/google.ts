import { z } from 'zod';

import { IdTokenSchema } from './openid.ts';

// https://developers.google.com/identity/protocols/oauth2#size
export const AuthorizationCode = z.string().min(1).max(256);
export const AccessToken = z.string().min(1).max(2048);

export const OAUTH_SCOPE = 'openid profile email';
export const OAUTH_TOKEN_TYPE = 'Bearer';

export const TokenResponseSchema = z.object({
    // Access token to the Google APIs.
    access_token: AccessToken,
    // OpenID token.
    id_token: IdTokenSchema,
    // Always set to `OAUTH_SCOPE` for now.
    scope: z.literal(OAUTH_SCOPE),
    // Always set to `OAUTH_TOKEN_TYPE` for now.
    token_type: z.literal(OAUTH_TOKEN_TYPE),
    // Remaining lifetime in seconds.
    expires_in: z.number().int(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
