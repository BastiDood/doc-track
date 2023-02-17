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

export namespace Office {
    export const Schema = z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(40),
    });

    export type Office = z.infer<typeof Schema>;
}
