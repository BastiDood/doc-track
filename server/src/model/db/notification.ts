import { z } from 'zod';

import { DocumentId } from './document.ts';
import { PushSubscriptionEndpoint } from './subscription.ts';

export const NotificationSchema = z.object({
    sub: PushSubscriptionEndpoint,
    doc: DocumentId,
});

export type Notification = z.infer<typeof NotificationSchema>;
