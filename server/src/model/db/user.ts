import { z } from 'zod';

import { Email } from './common.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export const UserSchema = z.object({
    id: GoogleUserId,
    name: z.string().max(40).default(''),
    email: Email,
});

export type User = z.infer<typeof UserSchema>;
