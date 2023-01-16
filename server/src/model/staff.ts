import { z } from '../deps.ts';
import { OfficeId } from './office.ts';
import { GoogleUserId } from './user.ts';

export const StaffSchema = z.object({
    user: GoogleUserId,
    office: OfficeId,
    permission: z.number().int().positive(),
});

export type Staff = z.infer<typeof StaffSchema>;
