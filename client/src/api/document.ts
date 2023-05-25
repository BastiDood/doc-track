import { StatusCodes } from 'http-status-codes';

import type { Document as DocumentType } from '~model/document.ts';
import type { Office } from '~model/office.ts';

import {
    type AllInbox,
    type AllOutbox,
    type BarcodeAssignmentError,
    type InboxEntry,
    type PaperTrail,
    AllInboxSchema,
    AllOutboxSchema,
    BarcodeAssignmentErrorSchema,
    InboxEntrySchema,
    PaperTrailSchema,
} from '../../../model/src/api.ts';
import { type Snapshot, SnapshotSchema } from '../../../model/src/snapshot.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    DeferredSnap,
    TooLarge,
    UncachedFetch,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Document {
    export async function create(
        oid: Office['id'],
        data: Blob,
        { id, title, category }: Pick<DocumentType, 'id' | 'title' | 'category'>,
        remark: Snapshot['remark'],
    ): Promise<Snapshot['creation'] | BarcodeAssignmentError> {
        const body = new FormData;
        body.set('id', id);
        body.set('title', title);
        body.set('category', category.toString());
        body.set('remark', remark);
        body.set('data', data);

        const res = await fetch(`/api/document?office=${oid}`, {
            credentials: 'same-origin',
            method: 'POST',
            body,
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.CREATED: return SnapshotSchema.shape.creation.parse(await res.json());
            case StatusCodes.CONFLICT: return BarcodeAssignmentErrorSchema.parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            case StatusCodes.REQUEST_TOO_LONG: throw new TooLarge;
            case StatusCodes.SERVICE_UNAVAILABLE: throw new DeferredSnap;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function download(did: DocumentType['id'], mime: string): Promise<Blob | null> {
        const res = await fetch(`/api/document/download?doc=${did}`, {
            headers: { 'Accept': mime },
        });
        switch (res.status) {
            case StatusCodes.OK: return res.blob();
            case StatusCodes.NOT_FOUND: return null;
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function getDossier(oid: Office['id']): Promise<InboxEntry[]> {
        const res = await fetch(`/api/dossier?office=${oid}`, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return InboxEntrySchema.array().parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            case StatusCodes.SERVICE_UNAVAILABLE: throw new UncachedFetch;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function getInbox(oid: Office['id']): Promise<AllInbox> {
        const res = await fetch(`/api/inbox?office=${oid}`, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return AllInboxSchema.parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            case StatusCodes.SERVICE_UNAVAILABLE: throw new UncachedFetch;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function getOutbox(oid: Office['id']): Promise<AllOutbox> {
        const res = await fetch(`/api/outbox?office=${oid}`, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return AllOutboxSchema.parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            case StatusCodes.SERVICE_UNAVAILABLE: throw new UncachedFetch;
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
            case StatusCodes.SERVICE_UNAVAILABLE: throw new UncachedFetch;
            default: throw new UnexpectedStatusCode;
        }
    }
}
