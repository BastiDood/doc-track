import { z } from 'zod';

export const PushSubscriptionId = z.string().url();

export const PushSubscriptionSchema = z.object({
	endpoint: PushSubscriptionId,
	expirationTime: z.coerce.date().nullable(),
});

export type PushSubscription = z.infer<typeof PushSubscriptionSchema>;
