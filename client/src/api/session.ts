import { StatusCodes } from 'http-status-codes';

import { type User, UserSchema } from '../../../model/src/user.ts';

import {
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Session {
    export async function getUser(): Promise<User> {
        const res = await fetch('/api/session', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return UserSchema.parse(await res.json());
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
