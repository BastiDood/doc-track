import { z } from 'zod';

import { BarcodeSchema } from './barcode.ts';
import { BatchSchema } from './batch.ts';

export const MinBatchSchema = z.object({
    batch: BatchSchema.shape.id,
    codes: BarcodeSchema.shape.code.array(),
});

export type MinBatch = z.infer<typeof MinBatchSchema>;

export const GeneratedBatchSchema = BatchSchema
    .omit({ office: true, generator: true })
    .and(z.object({ codes: BarcodeSchema.shape.code.array() }))

export type GeneratedBatch = z.infer<typeof GeneratedBatchSchema>;

export enum InsertSnapshotError {
    DocumentNotFound,
    EvaluatorNotFound,
    TargetNotFound,
    InvalidStatus,
}
