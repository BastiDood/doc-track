import { z } from 'zod';

import { AccessToken, RefreshToken } from '../oauth/google.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export const SessionId = z.string().min(1);

export const SessionSchema = z.object({
    id: SessionId,
    user: GoogleUserId,
    expiration: z.coerce.date(),
    access_token: AccessToken,
    refresh_token: RefreshToken,
});
