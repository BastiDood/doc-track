import { StatusCodes } from 'http-status-codes';

import { type BarcodeMetrics, BarcodeMetricsSchema } from '../../../model/src/api.ts';
import { type Metrics as MetricsType, MetricsSchema } from '../../../model/src/metrics.ts';
import type { Office } from '../../../model/src/office.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
    UncachedFetch,
} from './error.ts';

export namespace Metrics {
    export async function generateBarcodeSummary(oid: Office['id']): Promise<BarcodeMetrics> {
        const res = await fetch(`/api/metrics/barcode?office=${oid}`, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return BarcodeMetricsSchema.parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            case StatusCodes.SERVICE_UNAVAILABLE: throw new UncachedFetch;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function generateUserSummary(): Promise<MetricsType> {
        const res = await fetch('/api/metrics/user', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return MetricsSchema.parse(await res.json());
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            case StatusCodes.SERVICE_UNAVAILABLE: throw new UncachedFetch;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function generateLocalSummary(oid: Office['id']): Promise<MetricsType> {
        const res = await fetch(`/api/metrics/office?id=${oid}`, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return MetricsSchema.parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            case StatusCodes.SERVICE_UNAVAILABLE: throw new UncachedFetch;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function generateGlobalSummary(): Promise<MetricsType> {
        const res = await fetch('/api/metrics/system', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return MetricsSchema.parse(await res.json());
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            case StatusCodes.SERVICE_UNAVAILABLE: throw new UncachedFetch;
            default: throw new UnexpectedStatusCode;
        }
    }
}
