import { StatusCodes } from 'http-status-codes';

import { type StaffMember, StaffMemberSchema } from '../../../model/src/api.ts';
import type { Office } from '../../../model/src/office.ts';
import type { Staff as StaffType } from '../../../model/src/staff.ts';
import type { User } from '../../../model/src/user.ts';

import {
    AlreadyMember,
    BadContentNegotiation,
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    UnexpectedStatusCode,
    UncachedFetch,
} from './error.ts';

export namespace Staff {
    export async function add(uid: User['id'], oid: Office['id']): Promise<boolean> {
        const res = await fetch(`/api/staff?user=${uid}&office=${oid}`, {
            method: 'POST',
            credentials: 'same-origin',
        });
        switch (res.status) {
            case StatusCodes.CREATED: return true;
            case StatusCodes.NOT_FOUND: return false;
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.CONFLICT: throw new AlreadyMember;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function get(oid: Office['id']): Promise<StaffMember[]> {
        const res = await fetch(`/api/staffs?office=${oid}`, {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return StaffMemberSchema.array().parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            case StatusCodes.SERVICE_UNAVAILABLE: throw new UncachedFetch;
            default: throw new UnexpectedStatusCode;
        }
    }

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
