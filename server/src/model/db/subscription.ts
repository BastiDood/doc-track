import { z } from 'zod';

export const PushSubscriptionId = z.number().int().nonnegative();

export const PushSubscriptionSchema = z.object({
    id: PushSubscriptionId,
	endpoint: z.string().url(),
	expirationTime: z.coerce.date().nullable(),
});

export type PushSubscription = z.infer<typeof PushSubscriptionSchema>;
