import { z } from 'zod';

import { OfficeSchema } from './office.ts';
import { UserSchema } from './user.ts';

export const BatchSchema = z.object({
    id: z.number().int().positive(),
    generator: UserSchema.shape.id,
    office: OfficeSchema.shape.id,
    creation: z.coerce.date(),
});

export type Batch = z.infer<typeof BatchSchema>;
