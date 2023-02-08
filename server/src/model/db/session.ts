import { z } from 'zod';

import { PendingSchema } from './pending.ts';
import { AccessToken } from '../oauth/google.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export const SessionSchema = z.object({
    id: PendingSchema.shape.id,
    user_id: GoogleUserId,
    expiration: z.coerce.date(),
    access_token: AccessToken,
});

export type Session = z.infer<typeof SessionSchema>;
