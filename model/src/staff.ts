import { z } from 'zod';

import { Permission } from './common.ts';
import { OfficeSchema } from './office.ts';
import { UserSchema } from './user.ts';

export const StaffSchema = z.object({
    user_id: UserSchema.shape.id,
    office: OfficeSchema.shape.id,
    permission: Permission,
    active: z.boolean(),
});

export type Staff = z.infer<typeof StaffSchema>;
