import { z } from 'zod';

import { Email } from './common.ts';

export const GoogleUserId = z.string().max(255);

export const UserSchema = z.object({
    id: GoogleUserId,
    first_name: z.string().max(20),
    last_name: z.string().max(20),
    email: Email,
});

export type User = z.infer<typeof UserSchema>;
