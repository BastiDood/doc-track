import { z } from 'zod';

import { Email, Permission } from './common.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export const UserSchema = z.object({
    id: GoogleUserId,
    name: z.string().max(40).default(''),
    email: Email,
    permission: Permission,
});

export type User = z.infer<typeof UserSchema>;
