import {
    CREATED,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_ACCEPTABLE,
    CONFLICT,
} from 'http-status';

import type { Office } from '~model/office.ts';

import { type InsertSnapshotError, InsertSnapshotErrorSchema } from '~model/api.ts';
import { type Snapshot as SnapshotType, SnapshotSchema } from '~model/snapshot.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Snapshot {
    export async function insert(
        oid: Office['id'],
        info: Omit<SnapshotType, 'creation' | 'evaluator'>,
    ): Promise<SnapshotType['creation'] | InsertSnapshotError> {
        const res = await fetch(`/api/snapshot?office=${oid}`, {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify(info),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        switch (res.status) {
            case CREATED: return SnapshotSchema.shape.creation.parse(await res.json());
            case CONFLICT: return InsertSnapshotErrorSchema.parse(await res.json());
            case BAD_REQUEST: throw new InvalidInput;
            case UNAUTHORIZED: throw new InvalidSession;
            case FORBIDDEN: throw new InsufficientPermissions;
            case NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
