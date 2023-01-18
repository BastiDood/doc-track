import { z } from 'zod';

export const CategoryId = z.number().int();

export const CategorySchema = z.object({
    id: CategoryId,
    name: z.string().max(20),
});

export type Category = z.infer<typeof CategorySchema>;
