import { z } from 'zod';

import { BarcodeSchema } from './barcode.ts';
import { CategorySchema } from './category.ts';

// NOTE: File BLOB is notably excluded from here.
export const DocumentSchema = z.object({
    id: BarcodeSchema.shape.code,
    category: CategorySchema.shape.id,
    title: z.string().min(1).max(40),
    data: z.instanceof(Uint8Array),
    mime: z.string(),
});

export type Document = z.infer<typeof DocumentSchema>;
