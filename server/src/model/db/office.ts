import { z } from 'zod';

export const OfficeId = z.number().int();

export const OfficeSchema = z.object({
    id: OfficeId,
    name: z.string().min(1).max(40),
});

export type Office = z.infer<typeof OfficeSchema>;
