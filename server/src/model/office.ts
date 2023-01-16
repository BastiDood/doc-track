import { z } from '../deps.ts';

export const OfficeId = z.number().int();

export const OfficeSchema = z.object({
    id: OfficeId,
    name: z.string().max(40),
});

export type Office = z.infer<typeof OfficeSchema>;
