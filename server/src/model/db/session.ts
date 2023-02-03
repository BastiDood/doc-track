import { z } from 'zod';

import { AccessToken } from '../oauth/google.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export const SessionId = z.string().min(1);

export const SessionSchema = z.object({
    id: SessionId,
    user_id: GoogleUserId,
    expiration: z.coerce.date(),
    access_token: AccessToken,
});

export type Session = z.infer<typeof SessionSchema>;
