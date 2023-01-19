import { z } from 'zod';

export const CategoryId = z.number().int();

export const CategorySchema = z.object({
    id: CategoryId,
    name: z.string().min(1).max(20),
});

export type Category = z.infer<typeof CategorySchema>;
