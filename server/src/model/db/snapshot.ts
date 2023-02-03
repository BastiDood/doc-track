import { z } from 'zod';

import { DocumentId } from './document.ts';
import { OfficeId } from './office.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export enum Status {
    Register,
    Send,
    Receive,
    Terminate,
}

export const SnapshotSchema = z.object({
    doc: DocumentId,
    creation: z.coerce.date(),
    evaluator: GoogleUserId,
    status: z.nativeEnum(Status),
    remark: z.string().min(1).max(32),
    target: OfficeId,
});

export type Snapshot = z.infer<typeof SnapshotSchema>;
