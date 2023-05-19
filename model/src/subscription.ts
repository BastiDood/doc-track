import { z } from 'zod';

export const PushSubscriptionSchema = z.object({
	endpoint: z.string().url(),
	expiration: z.coerce.date(),
    auth: z.instanceof(Uint8Array),
    p256dh: z.instanceof(Uint8Array),
});

export const PushSubscriptionJsonSchema = z.object({
    ...PushSubscriptionSchema.shape,
    expiration: z.coerce.date().nullable(),
    auth: z.string().min(1),
    p256dh: z.string().min(1),
});

export type PushSubscription = z.infer<typeof PushSubscriptionSchema>;
export type PushSubscriptionJson = z.infer<typeof PushSubscriptionJsonSchema>;
