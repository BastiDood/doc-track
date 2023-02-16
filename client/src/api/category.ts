import { z } from 'zod';
import { InsufficientPermissions, InvalidInput, InvalidSession, UnexpectedStatusCode } from './error';

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
            case 200: return Schema.array().parse(await res.json());
            case 401: throw new InvalidSession;
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
            case 201: return Schema.shape.id.parse(JSON.parse(await res.json()));
            case 401: throw new InvalidSession;
            case 400: throw new InvalidInput;
            case 403: throw new InsufficientPermissions;
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
            case 204: return true;
            case 404: return false;
            case 401: throw new InvalidSession;
            case 400: throw new InvalidInput;
            case 403: throw new InsufficientPermissions;
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
        const params = new URLSearchParams({ id: id.toString() });
        const res = await fetch('/api/category?' + params.toString(), {
            method: 'DELETE',
            credentials: 'same-origin',
        });
        switch (res.status) {
            case 202: return false;
            case 204: return true;
            case 404: return null;
            case 401: throw new InvalidSession;
            case 400: throw new InvalidInput;
            case 403: throw new InsufficientPermissions;
            default: throw new UnexpectedStatusCode;
        }
    }

    /**
     * Requires a valid session for a system operator.
     * @returns string containing the {@linkcode Category} name if successful
     * @returns `null` if {@linkcode Category} ID does not exist
     */
    export async function activate(id: Category['id']): Promise<Category['name'] | null> {
        const params = new URLSearchParams({ id: id.toString() });
        const res = await fetch('/api/category?' + params.toString(), {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: { 'Accept': 'text/plain' },
        });
        switch (res.status) {
            case 200: return res.text();
            case 404: return null;
            case 400: throw new InvalidInput;
            case 401: throw new InvalidSession;
            case 403: throw new InsufficientPermissions;
            default: throw new UnexpectedStatusCode;
        }
    }
}
