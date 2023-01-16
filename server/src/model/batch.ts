import { z } from '../deps.ts';
import { GoogleUserId } from './user.ts';

export const BatchId = z.number().int();

export const BatchSchema = z.object({
    id: BatchId,
    generator: GoogleUserId,
    creation: z.coerce.date(),
});
