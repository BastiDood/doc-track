import { StatusCodes } from 'http-status-codes';

import { type User as UserType, UserSchema } from '../../../model/src/user.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
    UncachedFetch,
} from './error.ts';

export namespace User {
    export async function getAll(): Promise<UserType[]> {
        const res = await fetch('/api/users', {
            credentials: 'same-origin',
            headers: { 'Accepts': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return UserSchema.array().parse(await res.json());
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            case StatusCodes.SERVICE_UNAVAILABLE: throw new UncachedFetch;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function setPermission({ id, permission }: Pick<UserType, 'id' | 'permission'>): Promise<boolean> {
        const res = await fetch(`/api/user?perms=${permission}`, {
            credentials: 'same-origin',
            method: 'PATCH',
            body: id,
            headers: { 'Content-Type': 'text/plain' },
        });
        switch (res.status) {
            case StatusCodes.NO_CONTENT: return true;
            case StatusCodes.NOT_FOUND: return false;
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
