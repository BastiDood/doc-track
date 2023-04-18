import { StatusCodes } from 'http-status-codes';

import type { Office } from '~model/office.ts';

import { type InsertSnapshotError, InsertSnapshotErrorSchema } from '../../../model/src/api.ts';
import { type Snapshot as SnapshotType, SnapshotSchema } from '../../../model/src/snapshot.ts';

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
                'Content-Type': 'application/json',
            },
        });
        switch (res.status) {
            case StatusCodes.CREATED: return SnapshotSchema.shape.creation.parse(await res.json());
            case StatusCodes.CONFLICT: return InsertSnapshotErrorSchema.parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
