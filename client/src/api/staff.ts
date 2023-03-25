import { StatusCodes } from 'http-status-codes';

import type { Staff as StaffType } from '~model/staff.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Staff {
    export async function setPermission({ office, user_id, permission }: Omit<StaffType, 'active'>): Promise<boolean> {
        const res = await fetch(`/api/staff?office=${office}&perms=${permission}`, {
            credentials: 'same-origin',
            method: 'PATCH',
            body: user_id,
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

    export async function remove({ office, user_id }: Pick<StaffType, 'office' | 'user_id'>): Promise<boolean | null> {
        const res = await fetch(`/api/staff?office=${office}`, {
            credentials: 'same-origin',
            method: 'DELETE',
            body: user_id,
            headers: { 'Content-Type': 'text/plain' },
        });
        switch (res.status) {
            case StatusCodes.ACCEPTED: return false;
            case StatusCodes.NO_CONTENT: return true;
            case StatusCodes.NOT_FOUND: return null;
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
