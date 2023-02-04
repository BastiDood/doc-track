import { z } from 'zod';

import { OfficeId } from './office.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export const BatchId = z.number().int();

export const BatchSchema = z.object({
    id: BatchId,
    generator: GoogleUserId,
    office: OfficeId,
    creation: z.coerce.date(),
});

export type Batch = z.infer<typeof BatchSchema>;
