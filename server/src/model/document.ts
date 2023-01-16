import { z } from '../deps.ts';
import { CategoryId } from './category.ts';

export const DocumentId = z.string().uuid();

// NOTE: File BLOB is notably excluded from here.
export const DocumentSchema = z.object({
    id: DocumentId,
    title: z.string().max(40),
    category: CategoryId,
});

export type Document = z.infer<typeof DocumentSchema>;
