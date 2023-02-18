import { z } from 'zod';

import { Email, Permission } from './common.ts';
import { OfficeSchema } from './office.ts';

export const InvitationSchema = z.object({
    office: OfficeSchema.shape.id,
    email: Email,
    permission: Permission,
    creation: z.coerce.date(),
});

export type Invitation = z.infer<typeof InvitationSchema>;
