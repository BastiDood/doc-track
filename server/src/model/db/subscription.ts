import { z } from 'zod';

export const PushSubscriptionId = z.string().url();

export const PushSubscriptionSchema = z.object({
	endpoint: PushSubscriptionId,
	expirationTime: z.coerce.date(),
    auth: z.instanceof(Uint8Array),
    p256dh: z.instanceof(Uint8Array).refine(bytes => bytes.length === 64),
});

export type PushSubscription = z.infer<typeof PushSubscriptionSchema>;
