import { z } from '../deps.ts';

export const PendingId = z.string().uuid();

export const PendingSchema = z.object({
    id: PendingId,
    nonce: z.coerce.bigint(),
    expiration: z.coerce.date(),
});

export type Pending = z.infer<typeof PendingSchema>;
