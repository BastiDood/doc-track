import { decode } from 'base64url';
import { z } from 'zod';

export const PushSubscriptionSchema = z.object({
	endpoint: z.string().url(),
	expirationTime: z.coerce.date(),
    auth: z.instanceof(Uint8Array),
    p256dh: z.instanceof(Uint8Array).refine(bytes => bytes.length === 64),
});

export const PushSubscriptionJsonSchema = z.object({
    ...PushSubscriptionSchema.shape,
    auth: z.string().min(1).transform(decode),
    p256dh: z.string().min(1).transform(decode),
});

export type PushSubscription = z.infer<typeof PushSubscriptionSchema>;
export type PushSubscriptionJson = z.infer<typeof PushSubscriptionJsonSchema>;
