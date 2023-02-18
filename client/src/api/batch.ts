import {
    CREATED,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN
} from 'http-status';
import { z } from 'zod';

import { BarcodeSchema } from '~model/barcode.ts';
import { BatchSchema } from '~model/batch.ts';

import type { Office } from '~model/office.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    UnexpectedStatusCode
} from './error.ts';

export namespace Batch {
    export const GeneratedBatchSchema = BatchSchema
        .omit({ office: true, generator: true })
        .and(z.object({ codes: BarcodeSchema.shape.code.array() }));

    export type GeneratedBatch = z.infer<typeof GeneratedBatchSchema>;

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
            default: throw new UnexpectedStatusCode;
        }
    }
}
