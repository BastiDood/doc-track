import { z } from 'zod';

// https://developers.google.com/identity/protocols/oauth2#size
export const AuthorizationCode = z.string().min(1).max(256);

const OAUTH_SCOPES = [ 'openid', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email' ];
export const OAUTH_SCOPE_STRING = OAUTH_SCOPES.join(' ');
export const OAUTH_TOKEN_TYPE = 'Bearer';

export const TokenResponseSchema = z.object({
    // JSON Web Token token containing the user's ID token.
    id_token: z.string().min(1),
    // Always set to `OAUTH_SCOPE` for now.
    scope: z.string().transform(str => new Set(str.split(' '))).refine(set => OAUTH_SCOPES.every(s => set.has(s))),
    // Always set to `OAUTH_TOKEN_TYPE` for now.
    token_type: z.literal(OAUTH_TOKEN_TYPE),
    // Remaining lifetime in seconds.
    expires_in: z.number().int(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
