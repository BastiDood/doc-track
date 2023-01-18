import { z } from 'zod';

import { BatchId } from './batch.ts';

export const BarcodeId = z.string().uuid();

export const BarcodeSchema = z.object({
    code: BarcodeId,
    batch: BatchId,
});

export type Barcode = z.infer<typeof BarcodeSchema>;
