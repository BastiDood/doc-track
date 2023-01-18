import { z } from 'zod';

import { GoogleUserId } from './user.ts';

// https://developers.google.com/identity/protocols/oauth2#size
export const AuthorizationCode = z.string().max(256);
export const AccessToken = z.string().max(2048);
export const RefreshToken = z.string().max(512);

export const SessionId = z.string();

export const SessionSchema = z.object({
    id: SessionId,
    user: GoogleUserId,
    expiration: z.coerce.date(),
    access_token: AccessToken,
    refresh_token: RefreshToken,
});
