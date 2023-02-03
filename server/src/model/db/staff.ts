import { z } from 'zod';

import { Permission } from './common.ts';
import { OfficeId } from './office.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export const StaffSchema = z.object({
    user_id: GoogleUserId,
    office: OfficeId,
    permission: Permission,
});

export type Staff = z.infer<typeof StaffSchema>;
