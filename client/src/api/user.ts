import {
    NO_CONTENT,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    NOT_ACCEPTABLE,
} from 'http-status';

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
            case NO_CONTENT: return true;
            case NOT_FOUND: return false;
            case BAD_REQUEST: throw new InvalidInput;
            case UNAUTHORIZED: throw new InvalidSession;
            case FORBIDDEN: throw new InsufficientPermissions;
            case NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
