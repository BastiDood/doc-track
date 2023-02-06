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
            const categories: Category[] = await db.getAllCategories();
            info(`[Category] Fetched all categories for session ${sid}`);
            return new Response(JSON.stringify(categories));
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
 * - `400` => category name is unacceptable
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
        info(`[Category] User ${user.id} ${user.name} <${user.email}> added new category ${id} "${category}"`);
        return new Response(id.toString(), { status: Status.Created });
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
 * - Accepts the to-be-deleted {@linkcode Category} ID in the {@linkcode Response} body.
 *
 * # Outputs
 * - `200` => returns the deleted category name as plaintext in the {@linkcode Response} body
 * - `400` => {@linkcode Category} ID is not an integer
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `404` => {@linkcode Category} ID does not exist
 */
export async function handleDeleteCategory(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const id = parseInt(await req.text(), 10);
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
        const name = await db.deleteCategory(id);
        if (name) {
            info(`[Category] User ${user.id} ${user.name} <${user.email}> deleted category ${id} "${name}"`);
            return new Response(name);
        }

        error(`[Category] User ${user.id} ${user.name} <${user.email}> attempted to delete non-existent category ${id}`);
        return new Response(null, { status: Status.NotFound });
    } finally {
        db.release();
    }
}
