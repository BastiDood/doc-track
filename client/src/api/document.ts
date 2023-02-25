import {
    CREATED,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_ACCEPTABLE,
    CONFLICT,
} from 'http-status';

import type { Document as DocumentType } from '~model/document.ts';
import type { Office } from '~model/office.ts';

import { type BarcodeAssignmentError, BarcodeAssignmentErrorSchema } from '~model/api.ts';
import { type Snapshot, SnapshotSchema } from '~model/snapshot.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode
} from './error.ts';

export namespace Document {
    export async function create(
        oid: Office['id'],
        doc: DocumentType,
        remark: Snapshot['remark'],
    ): Promise<Snapshot['creation'] | BarcodeAssignmentError> {
        const res = await fetch(`/api/document?office=${oid}`, {
            method: 'POST',
            body: JSON.stringify({ ...doc, remark }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        switch (res.status) {
            case CREATED: return SnapshotSchema.shape.creation.parse(await res.json());
            case CONFLICT: return BarcodeAssignmentErrorSchema.parse(await res.json());
            case BAD_REQUEST: throw new InvalidInput;
            case UNAUTHORIZED: throw new InvalidSession;
            case FORBIDDEN: throw new InsufficientPermissions;
            case NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
