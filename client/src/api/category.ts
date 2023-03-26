import { StatusCodes } from 'http-status-codes';

import { type Category as CategoryType, CategorySchema } from '~model/category.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    BadContentNegotiation,
    UnexpectedStatusCode,
} from './error.ts';

export namespace Category {
    /**
     * Requires a valid session for a valid session.
     * @returns list of active {@linkcode Category} entries
     */
    export async function getAllActive(): Promise<Pick<CategoryType, 'id' | 'name'>[]> {
        const res = await fetch('/api/categories', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case StatusCodes.OK: return CategorySchema.pick({ id: true, name: true }).array().parse(await res.json());
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }

    /**
     * Requires a valid session for a system operator.
     * @returns ID of the new {@linkcode Category} entry
     */
    export async function create(name: CategoryType['name']): Promise<CategoryType['id']> {
        const res = await fetch('/api/category', {
            credentials: 'same-origin',
            method: 'POST',
            body: name,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/plain',
            },
        });
        switch (res.status) {
            case StatusCodes.CREATED: return CategorySchema.shape.id.parse(JSON.parse(await res.json()));
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }

    /**
     * Requires a valid session for a system operator.
     * @returns `false` if {@linkcode Category} ID does not exist
     */
    export async function rename(id: CategoryType['id'], name: CategoryType['name']): Promise<boolean> {
        const res = await fetch('/api/category', {
            credentials: 'same-origin',
            method: 'PUT',
            body: JSON.stringify({ id, name }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
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

    /**
     * Requires a valid session for a system operator.
     * @returns `false` if {@linkcode Category} was deprecated instead
     * @returns `true` if {@linkcode Category} was successfully deleted
     * @returns `null` if {@linkcode Category} ID does not exist
     */
    export async function remove(id: CategoryType['id']): Promise<boolean | null> {
        const res = await fetch(`/api/category?id=${id}`, {
            method: 'DELETE',
            credentials: 'same-origin',
        });
        switch (res.status) {
            case StatusCodes.ACCEPTED: return false;
            case StatusCodes.NO_CONTENT: return true;
            case StatusCodes.NOT_FOUND: return null;
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            default: throw new UnexpectedStatusCode;
        }
    }

    /**
     * Requires a valid session for a system operator.
     * @returns string containing the {@linkcode Category} name if successful
     * @returns `null` if {@linkcode Category} ID does not exist
     */
    export async function activate(id: CategoryType['id']): Promise<CategoryType['name'] | null> {
        const res = await fetch(`/api/category?id=${id}`, {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: { 'Accept': 'text/plain' },
        });
        switch (res.status) {
            case StatusCodes.OK: return res.text();
            case StatusCodes.NOT_FOUND: return null;
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.UNAUTHORIZED: throw new InvalidSession;
            case StatusCodes.FORBIDDEN: throw new InsufficientPermissions;
            default: throw new UnexpectedStatusCode;
        }
    }
}
