import {
    OK,
    CREATED,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    NOT_ACCEPTABLE,
} from 'http-status';

import {
    type GeneratedBatch,
    type MinBatch,
    GeneratedBatchSchema,
    MinBatchSchema
} from '~model/api.ts';
import type { Office } from '~model/office.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode
} from './error.ts';

export namespace Batch {
    export async function getEarliestBatch(office: Office['id']): Promise<MinBatch | null> {
        const res = await fetch(`/api/batch?office=${office}`, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case OK: return MinBatchSchema.parse(await res.json());
            case NOT_FOUND: return null;
            case BAD_REQUEST: throw new InvalidInput;
            case UNAUTHORIZED: throw new InvalidSession;
            case NOT_ACCEPTABLE: throw new BadContentNegotiation;
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
            case CREATED: return GeneratedBatchSchema.parse(await res.json());
            case BAD_REQUEST: throw new InvalidInput;
            case UNAUTHORIZED: throw new InvalidSession;
            case FORBIDDEN: throw new InsufficientPermissions;
            case NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}