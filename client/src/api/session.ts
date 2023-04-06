import { StatusCodes } from 'http-status-codes';

import { type FullSession, FullSessionSchema } from '../../../model/src/api.ts';

import {
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Session {
    export async function getUser(): Promise<FullSession> {
        const res = await fetch('/api/session', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return FullSessionSchema.parse(await res.json());
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }
}
