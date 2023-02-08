import { z } from 'zod';

import { DocumentSchema } from './document.ts';
import { OfficeSchema } from './office.ts';
import { GoogleUserId } from '../oauth/openid.ts';

export enum Status {
    Register,
    Send,
    Receive,
    Terminate,
}

export const SnapshotSchema = z.object({
    doc: DocumentSchema.shape.id,
    creation: z.coerce.date(),
    evaluator: GoogleUserId,
    status: z.nativeEnum(Status),
    remark: z.string().min(1).max(32),
    target: OfficeSchema.shape.id,
});

export type Snapshot = z.infer<typeof SnapshotSchema>;
