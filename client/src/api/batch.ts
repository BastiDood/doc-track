import { StatusCodes } from 'http-status-codes';

import {
    type GeneratedBatch,
    type MinBatch,
    GeneratedBatchSchema,
    MinBatchSchema,
} from '~model/api.ts';
import type { Office } from '~model/office.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Batch {
    export async function getEarliestBatch(office: Office['id']): Promise<MinBatch | null> {
        const res = await fetch(`/api/batch?office=${office}`, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return MinBatchSchema.parse(await res.json());
            case StatusCodes.NOT_FOUND: return null;
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function generate(office: Office['id']): Promise<GeneratedBatch> {
        const res = await fetch(`/api/batch?office=${office}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.CREATED: return GeneratedBatchSchema.parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
