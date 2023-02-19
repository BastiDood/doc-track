import {
    ACCEPTED,
    NO_CONTENT,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    NOT_ACCEPTABLE,
} from 'http-status';

import type { Staff as StaffType } from '~model/staff.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode
} from './error.ts';

export namespace Staff {
    export async function setPermission({ office, user_id, permission }: Omit<StaffType, 'active'>): Promise<boolean> {
        const res = await fetch(`/api/staff?office=${office}&perms=${permission}`, {
            method: 'PATCH',
            credentials: 'same-origin',
            body: user_id,
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

    export async function remove({ office, user_id }: Pick<StaffType, 'office' | 'user_id'>): Promise<boolean | null> {
        const res = await fetch(`/api/staff?office=${office}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            body: user_id,
            headers: { 'Content-Type': 'text/plain' },
        });
        switch (res.status) {
            case ACCEPTED: return false;
            case NO_CONTENT: return true;
            case NOT_FOUND: return null;
            case BAD_REQUEST: throw new InvalidInput;
            case UNAUTHORIZED: throw new InvalidSession;
            case FORBIDDEN: throw new InsufficientPermissions;
            case NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
