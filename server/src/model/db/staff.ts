import { z } from 'zod';

import { Permission } from './common.ts';
import { OfficeSchema } from './office.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export const StaffSchema = z.object({
    user_id: GoogleUserId,
    office: OfficeSchema.shape.id,
    permission: Permission,
});

export type Staff = z.infer<typeof StaffSchema>;
