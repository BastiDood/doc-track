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

export namespace User {
    export const Email = z.string().max(32).email();
    export const Permission = z.string().transform(bits => parseInt(bits, 2));

    export const Schema = z.object({
        id: z.string().min(1).max(255),
        name: z.string().max(40).default(''),
        email: Email,
        picture: z.string().url(),
        permission: Permission,
    });

    export type User = z.infer<typeof UserSchema>;
}
