import { z } from 'zod';

import { DocumentSchema } from './document.ts';
import { OfficeSchema } from './office.ts';
import { UserSchema } from './user.ts';

export enum Status {
    Register = 'Register',
    Send = 'Send',
    Receive = 'Receive',
    Terminate = 'Terminate',
}

export const StatusSchema = z.nativeEnum(Status);

export const SnapshotSchema = z.object({
    doc: DocumentSchema.shape.id,
    creation: z.coerce.date(),
    evaluator: UserSchema.shape.id,
    status: z.nativeEnum(Status),
    remark: z.string().max(32),
    target: OfficeSchema.shape.id.nullable(),
});

export type Snapshot = z.infer<typeof SnapshotSchema>;
