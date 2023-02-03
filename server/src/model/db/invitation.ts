import { z } from 'zod';

import { Email, Permission } from './common.ts';
import { OfficeId } from './office.ts';

export const InvitationSchema = z.object({
    office: OfficeId,
    email: Email,
    permission: Permission,
    creation: z.coerce.date(),
});

export type Invitation = z.infer<typeof InvitationSchema>;
