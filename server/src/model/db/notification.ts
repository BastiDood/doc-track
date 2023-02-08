import { z } from 'zod';

import { DocumentSchema } from './document.ts';
import { PushSubscriptionSchema } from './subscription.ts';

export const NotificationSchema = z.object({
    sub: PushSubscriptionSchema.shape.endpoint,
    doc: DocumentSchema.shape.id,
});

export type Notification = z.infer<typeof NotificationSchema>;
