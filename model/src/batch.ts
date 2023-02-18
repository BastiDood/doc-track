import { z } from 'zod';

import { BarcodeSchema } from './barcode.ts';
import { OfficeSchema } from './office.ts';
import { UserSchema } from './user.ts';

export const BatchSchema = z.object({
    id: z.number().int().positive(),
    generator: UserSchema.shape.id,
    office: OfficeSchema.shape.id,
    creation: z.coerce.date(),
});

export type Batch = z.infer<typeof BatchSchema>;

export const MinBatchSchema = z.object({
    batch: BatchSchema.shape.id,
    codes: BarcodeSchema.shape.code.array(),
});

export type MinBatch = z.infer<typeof MinBatchSchema>;

export const GeneratedBatchSchema = BatchSchema
    .omit({ office: true, generator: true })
    .and(z.object({ codes: BarcodeSchema.shape.code.array() }))

export type GeneratedBatch = z.infer<typeof GeneratedBatchSchema>;
