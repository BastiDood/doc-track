import { StatusCodes } from 'http-status-codes';

import type { Document as DocumentType } from '~model/document.ts';
import type { Office } from '~model/office.ts';

import {
    type BarcodeAssignmentError,
    type InboxEntry,
    type PaperTrail,
    BarcodeAssignmentErrorSchema,
    InboxEntrySchema,
    PaperTrailSchema,
} from '../../../model/src/snapshot.ts';
import { type Snapshot, SnapshotSchema } from '../../../model/src/snapshot.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Document {
    export async function create(
        oid: Office['id'],
        doc: DocumentType,
        remark: Snapshot['remark'],
    ): Promise<Snapshot['creation'] | BarcodeAssignmentError> {
        const res = await fetch(`/api/document?office=${oid}`, {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify({ ...doc, remark }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        switch (res.status) {
            case StatusCodes.CREATED: return SnapshotSchema.shape.creation.parse(await res.json());
            case StatusCodes.CONFLICT: return BarcodeAssignmentErrorSchema.parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function getInbox(oid: Office['id']): Promise<InboxEntry[]> {
        const res = await fetch(`/api/inbox?office=${oid}`, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return InboxEntrySchema.array().parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function getPaperTrail(doc: DocumentType['id']): Promise<PaperTrail[]> {
        const res = await fetch(`/api/document?doc=${doc}`, {
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return PaperTrailSchema.array().parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
