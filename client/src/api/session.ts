import { UNAUTHORIZED, NOT_ACCEPTABLE } from 'http-status';

import { UserSchema } from '~model/user.ts';

import {
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Session {
    export async function getUser(): Promise<SessionType['user']> {
        const res = await fetch('/api/session', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case OK: return UserSchema.parse(await res.json());
            case UNAUTHORIZED: throw new InvalidSession;
            case NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}