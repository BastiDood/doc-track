import { z } from 'zod';

import { DocumentId } from './document.ts';
import { PushSubscriptionId } from './subscription.ts';

export const NotificationSchema = z.object({
    sub: PushSubscriptionId,
    doc: DocumentId,
});

export type Notification = z.infer<typeof NotificationSchema>;
