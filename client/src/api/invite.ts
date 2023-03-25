import { StatusCodes } from 'http-status-codes';

import { type Invitation, InvitationSchema } from '~model/invitation.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Invite {
    export async function add({ email, office, permission }: Omit<Invitation, 'creation'>): Promise<Invitation['creation'] | null> {
        const res = await fetch(`/api/invite?office=${office}`, {
            credentials: 'same-origin',
            method: 'PUT',
            body: JSON.stringify({ email, permission }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        switch (res.status) {
            case StatusCodes.OK: return InvitationSchema.shape.creation.parse(await res.json());
            case StatusCodes.CONFLICT: return null;
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function revoke({ office, email }: Pick<Invitation, 'office' | 'email'>): Promise<Omit<Invitation, 'office' | 'email'> | null> {
        const res = await fetch(`/api/invite?office=${office}`, {
            credentials: 'same-origin',
            method: 'DELETE',
            body: email,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/plain',
            },
        });
        switch (res.status) {
            case StatusCodes.OK: return InvitationSchema.omit({ office: true, email: true }).parse(await res.json());
            case StatusCodes.NOT_FOUND: return null;
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
