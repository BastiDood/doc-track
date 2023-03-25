import { StatusCodes } from 'http-status-codes';

import type { User as UserType } from '~model/user.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace User {
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
