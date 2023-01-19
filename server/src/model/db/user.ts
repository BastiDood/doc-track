import { z } from 'zod';

import { Email } from './common.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export const UserSchema = z.object({
    id: GoogleUserId,
    first_name: z.string().max(20).default(''),
    last_name: z.string().max(20).default(''),
    email: Email,
});

export type User = z.infer<typeof UserSchema>;
