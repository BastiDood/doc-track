import { z } from 'zod';

export const OfficeSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(40),
});

export type Office = z.infer<typeof OfficeSchema>;
