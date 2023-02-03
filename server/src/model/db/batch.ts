import { z } from 'zod';

import { GoogleUserId } from '../oauth/openid.ts';

export const BatchId = z.number().int();

export const BatchSchema = z.object({
    id: BatchId,
    generator: GoogleUserId,
    creation: z.coerce.date(),
});
