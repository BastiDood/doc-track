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
import { z } from 'zod';

import {
    InsufficientPermissions,
    InvalidInput,
    InvalidSession,
    UnexpectedStatusCode
} from './error';

export namespace Category {
    export const Schema = z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(20),
        active: z.boolean(),
    });

    export type Category = z.infer<typeof Schema>;

    /**
     * Requires a valid session for a valid session.
     * @returns list of active {@linkcode Category} entries
     */
    export async function getAllActive(): Promise<Category[]> {
        const res = await fetch('/api/categories', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' },
        });
        switch (res.status) {
            case OK: return Schema.array().parse(await res.json());
            case UNAUTHORIZED: throw new InvalidSession;
            default: throw new UnexpectedStatusCode;
        }
    }

    /**
     * Requires a valid session for a system operator.
     * @returns ID of the new {@linkcode Category} entry
     */
    export async function create(name: Category['name']): Promise<Category['id']> {
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
            case CREATED: return Schema.shape.id.parse(JSON.parse(await res.json()));
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
    export async function rename(id: Category['id'], name: Category['name']): Promise<boolean> {
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
    export async function remove(id: Category['id']): Promise<boolean | null> {
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
    export async function activate(id: Category['id']): Promise<Category['name'] | null> {
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
