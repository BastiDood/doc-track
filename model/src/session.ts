import { z } from 'zod';

import { PendingSchema } from './pending.ts';
import { UserSchema } from './user.ts';

export const SessionSchema = z.object({
    id: PendingSchema.shape.id,
    user_id: UserSchema.shape.id,
    expiration: z.coerce.date(),
});

export type Session = z.infer<typeof SessionSchema>;
