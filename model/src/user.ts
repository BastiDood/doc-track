import { z } from 'zod';

import { Email, Permission } from './common.ts';

export const UserSchema = z.object({
    id: z.string().min(1).max(255),
    name: z.string().max(40).default(''),
    email: Email,
    picture: z.string().url(),
    permission: Permission,
});

export type User = z.infer<typeof UserSchema>;
