import {
    OK,
    CREATED,
    ACCEPTED,
    NO_CONTENT,
    BAD_REQUEST,
    NOT_FOUND,
    UNAUTHORIZED,
    FORBIDDEN
} from 'http-status';
import { z } from 'zod';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    UnexpectedStatusCode
} from './error';
import { Office } from './office';
import { User } from './user';

export namespace Barcode {
    export const Schema = z.object({
        code: z.string().uuid(),
        batch: Batch.Schema.shape.id,
    });

    export type Barcode = z.infer<typeof Schema>;
}

export namespace Batch {
    export const Schema = z.object({
        id: z.number().int().positive(),
        generator: User.Schema.shape.id,
        office: Office.Schema.shape.id,
        creation: z.coerce.date(),
    });

    export type Batch = z.infer<typeof Schema>;

    export const GeneratedBatchSchema = Schema
        .omit({ office: true, generator: true })
        .and(z.object({ codes: Barcode.Schema.shape.code.array() }));

    export type GeneratedBatch = z.infer<typeof GeneratedBatchSchema>;

    export async function generate(office: Office.Office['id']): Promise<GeneratedBatch> {
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
