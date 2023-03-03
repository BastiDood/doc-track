import {
    CREATED,
    NO_CONTENT,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    NOT_ACCEPTABLE,
} from 'http-status';

import { type Office as OfficeType, OfficeSchema } from '~model/office.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Office {
    export async function create(name: OfficeType['name']): Promise<OfficeType['id']> {
        const res = await fetch('/api/office', {
            credentials: 'same-origin',
            method: 'POST',
            body: name,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/plain',
            },
        });
        switch (res.status) {
            case CREATED: return OfficeSchema.shape.id.parse(await res.json());
            case BAD_REQUEST: throw new InvalidInput;
            case UNAUTHORIZED: throw new InvalidSession;
            case FORBIDDEN: throw new InsufficientPermissions;
            case NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }

    export async function update({ id, name }: OfficeType): Promise<boolean> {
        const res = await fetch(`/api/office?id=${id}`, {
            credentials: 'same-origin',
            method: 'PUT',
            body: name,
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
