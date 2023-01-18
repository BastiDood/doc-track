import { z } from 'zod';

export const PushSubscriptionId = z.string();

export const PushSubscriptionSchema = z.object({
    id: PushSubscriptionId,
	endpoint: z.string(),
	expirationTime: z.number().nullable(),
});

export type PushSubscription = z.infer<typeof PushSubscriptionSchema>;
