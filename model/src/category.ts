import { z } from 'zod';

export const CategorySchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(20),
    active: z.boolean(),
});

export interface AllCategories {
    active: CategoryWithoutActive[];
    retired: CategoryWithoutActive[];
}

export type Category = z.infer<typeof CategorySchema>;
export type CategoryWithoutActive = Omit<Category, "active">;