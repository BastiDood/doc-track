import { z } from 'zod';

import { BarcodeId } from './barcode.ts';
import { CategoryId } from './category.ts';

// NOTE: File BLOB is notably excluded from here.
export const DocumentSchema = z.object({
    id: BarcodeId,
    category: CategoryId,
    title: z.string().min(1).max(40),
});

export type Document = z.infer<typeof DocumentSchema>;
