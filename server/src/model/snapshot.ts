import { z } from '../deps.ts';
import { DocumentId } from './document.ts';
import { OfficeId } from './office.ts';
import { GoogleUserId } from './user.ts';

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
    remark: z.string().max(32),
    target: OfficeId,
});

export type Snapshot = z.infer<typeof SnapshotSchema>;
