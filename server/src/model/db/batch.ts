import { z } from 'zod';

import { OfficeSchema } from './office.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export const BatchSchema = z.object({
    id: z.number().int().positive(),
    generator: GoogleUserId,
    office: OfficeSchema.shape.id,
    creation: z.coerce.date(),
});

export type Batch = z.infer<typeof BatchSchema>;
