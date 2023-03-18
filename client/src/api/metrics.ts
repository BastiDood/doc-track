import {
    OK,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_ACCEPTABLE,
} from 'http-status';

import { type Metrics as MetricsType, MetricsSchema } from '~model/api.ts';

import {
    InsufficientPermissions,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Metrics {
    export async function generateUserSummary(): Promise<MetricsType> {
        const res = await fetch('/api/metrics/user', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case OK: return MetricsSchema.parse(await res.json());
            case UNAUTHORIZED: throw new InvalidSession;
            case FORBIDDEN: throw new InsufficientPermissions;
            case NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
