import {
    OK,
    CREATED,
    ACCEPTED,
    NO_CONTENT,
    BAD_REQUEST,
    NOT_FOUND,
    UNAUTHORIZED,
    FORBIDDEN
} from 'http-status';

import { type Category as CategoryType, CategorySchema } from '~model/category.ts';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    UnexpectedStatusCode
} from './error.ts';

export namespace Category {
    /**
     * Requires a valid session for a valid session.
     * @returns list of active {@linkcode Category} entries
     */
    export async function getAllActive(): Promise<CategoryType[]> {
        const res = await fetch('/api/categories', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case OK: return CategorySchema.array().parse(await res.json());
            case UNAUTHORIZED: throw new InvalidSession;
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
            case CREATED: return CategorySchema.shape.id.parse(JSON.parse(await res.json()));
            case BAD_REQUEST: throw new InvalidInput;
            case UNAUTHORIZED: throw new InvalidSession;
            case FORBIDDEN: throw new InsufficientPermissions;
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
            case NO_CONTENT: return true;
            case NOT_FOUND: return false;
            case BAD_REQUEST: throw new InvalidInput;
            case UNAUTHORIZED: throw new InvalidSession;
            case FORBIDDEN: throw new InsufficientPermissions;
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
            case ACCEPTED: return false;
            case NO_CONTENT: return true;
            case NOT_FOUND: return null;
            case BAD_REQUEST: throw new InvalidInput;
            case UNAUTHORIZED: throw new InvalidSession;
            case FORBIDDEN: throw new InsufficientPermissions;
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
            case OK: return res.text();
            case NOT_FOUND: return null;
            case BAD_REQUEST: throw new InvalidInput;
            case UNAUTHORIZED: throw new InvalidSession;
            case FORBIDDEN: throw new InsufficientPermissions;
            default: throw new UnexpectedStatusCode;
        }
    }
}
