import { z } from 'zod';

import { BatchSchema } from './batch.ts';

export const BarcodeSchema = z.object({
    code: z.string().uuid(),
    batch: BatchSchema.shape.id,
});

export type Barcode = z.infer<typeof BarcodeSchema>;
