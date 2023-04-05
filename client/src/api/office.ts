import { StatusCodes } from 'http-status-codes';

import { type Office as OfficeType, OfficeSchema } from '../../../model/src/office.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Office {
    export async function getAll(): Promise<OfficeType[]> {
        const res = await fetch('/api/offices', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return OfficeSchema.array().parse(await res.json());
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }

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
            case StatusCodes.CREATED: return OfficeSchema.shape.id.parse(await res.json());
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
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
