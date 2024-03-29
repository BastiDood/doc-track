import { z } from 'zod';

export const CategorySchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(20),
    active: z.boolean(),
});

export type Category = z.infer<typeof CategorySchema>;
