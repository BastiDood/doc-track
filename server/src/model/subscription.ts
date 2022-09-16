import { z } from '../deps.ts';

export const PushSubscriptionSchema = z.object({
	endpoint: z.string(),
	expirationTime: z.number().nullable(),
});

export type PushSubscription = z.infer<typeof PushSubscriptionSchema>;
