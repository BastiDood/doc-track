import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';

import { Database } from '../../database.ts';
import { type Category, CategorySchema } from '../../model/db/category.ts';

/**
 * Retrieves a list of all the categories in the system.
 *
 * # Inputs
 * - Requires a valid session ID of a system operator.
 * - Accepts `office` as a query parameter.
 *
 * # Outputs
 * - `200` => return {@linkcode Response} containing {@linkcode Category[]} as JSON body
 * - `401` => session ID is absent, expired, or otherwise malformed
 */
export async function handleGetAllCategories(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const db = await Database.fromPool(pool);
    try {
        if (await db.checkValidSession(sid)) {
            const categories: Pick<Category, 'id' | 'name'>[] = await db.getActiveCategories();
            info(`[Category] Fetched all categories for session ${sid}`);
            return new Response(JSON.stringify(categories), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        error(`[Category] Invalid session ${sid}`);
        return new Response(null, { status: Status.Unauthorized });
    } finally {
        db.release();
    }
}

/**
 * Creates a new system-wide {@linkcode Category}.
 *
 * # Inputs
 * - Requires a valid session ID of a system operator.
 * - Accepts the name of the new {@linkcode Category} as plaintext from the {@linkcode Request} body.
 *
 * # Outputs
 * - `201` => return {@linkcode Response} containing the ID `number` of the new category
 * - `400` => category name is duplicated or otherwise unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 */
export async function handleCreateCategory(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    // TODO: validate whether this is a legal category name
    const category = await req.text();
    if (!category) {
        error(`[Category] Session ${sid} failed to create category with empty name`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const user = await db.getUserFromSession(sid);
        if (user === null) {
            error(`[Category] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: check global permissions
        const id = await db.createCategory(category);
        if (id === null) {
            error(`[Category] User ${user.id} ${user.name} <${user.email}> attempted to create duplicate category "${category}"`);
            return new Response(null, { status: Status.BadRequest });
        }

        info(`[Category] User ${user.id} ${user.name} <${user.email}> added new category ${id} "${category}"`);
        return new Response(id.toString(), {
            headers: { 'Content-Type': 'application/json' },
            status: Status.Created,
        });
    } finally {
        db.release();
    }
}

/**
 * Renames an existing system-wide {@linkcode Category}.
 *
 * # Inputs
 * - Requires a valid session ID of a system operator.
 * - Accepts the name of the new {@linkcode Category} as plaintext from the {@linkcode Request} body.
 *
 * # Outputs
 * - `204` => {@linkcode Category} successfully renamed
 * - `400` => {@linkcode Category} name is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `404` => {@linkcode Category} ID does not exist
 */
export async function handleRenameCategory(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    // TODO: validate whether this is a legal category name
    const result = CategorySchema.safeParse(await req.json());
    if (!result.success) {
        error('[Category] Invalid category schema');
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const user = await db.getUserFromSession(sid);
        if (user === null) {
            error(`[Category] Invalid session`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: check global permissions
        if (await db.renameCategory(result.data)) {
            info(`[Category] User ${user.id} ${user.name} <${user.email}> renamed category ${result.data.id} to "${result.data.name}"`);
            return new Response(null, { status: Status.NoContent });
        }

        error(`[Category] User ${user.id} ${user.name} <${user.email}> attempted to rename non-existent category ${result.data.id} to "${result.data.name}"`);
        return new Response(null, { status: Status.NotFound });
    } finally {
        db.release();
    }
}

/**
 * Deletes an existing system-wide {@linkcode Category}.
 *
 * # Inputs
 * - Requires a valid session ID of a system operator.
 * - Accepts the to-be-deleted {@linkcode Category} ID via the `id` query parameter.
 *
 * # Outputs
 * - `202` => successful deletion
 * - `204` => successful deprecation (i.e., not permanently deleted)
 * - `400` => {@linkcode Category} ID is not an integer
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `404` => {@linkcode Category} ID does not exist
 */
export async function handleDeleteCategory(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const input = params.get('id');
    const id = input === null ? NaN : parseInt(input);
    if (isNaN(id)) {
        error('[Category] Malformed category ID');
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const user = await db.getUserFromSession(sid);
        if (user === null) {
            error(`[Category] Invalid session ID`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: check global permissions
        const result = await db.deleteCategory(id);
        if (result === null) {
            error(`[Category] User ${user.id} ${user.name} <${user.email}> attempted to delete non-existent category ${id}`);
            return new Response(null, { status: Status.NotFound });
        }

        info(`[Category] User ${user.id} ${user.name} <${user.email}> deleted category ${id} "${result}"`);
        return new Response(null, { status: result ? Status.NoContent : Status.Accepted });
    } finally {
        db.release();
    }
}

/**
 * Reactivates an existing system-wide {@linkcode Category}.
 *
 * # Inputs
 * - Requires a valid session ID of a system operator.
 * - Accepts the to-be-activated {@linkcode Category} ID via the `id` query parameter.
 *
 * # Outputs
 * - `200` => returns the {@linkcode Category} name as plaintext
 * - `400` => {@linkcode Category} ID is not an integer
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `404` => {@linkcode Category} ID does not exist
 */
export async function handleActivateCategory(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const input = params.get('id');
    const id = input === null ? NaN : parseInt(input);
    if (isNaN(id)) {
        error(`[Category] Invalid input from session ${sid}`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const user = await db.getUserFromSession(sid);
        if (user === null) {
            error(`[Category] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: check global permissions
        const name = await db.activateCategory(id);
        if (name) {
            info(`[Category] User ${user.id} ${user.name} <${user.email}> activated category ${id} "${name}"`);
            return new Response(name, {
                headers: { 'Content-Type': 'text/plain' },
            });
        }

        error(`[Category] User ${user.id} ${user.name} <${user.email}> attempted to delete non-existent category ${id}`);
        return new Response(null, { status: Status.NotFound });
    } finally {
        db.release();
    }
}
