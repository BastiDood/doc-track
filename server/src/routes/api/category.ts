import { getCookies } from 'cookie';
import { parseMediaType } from 'parse-media-type';
import { Status } from 'http';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { Pool } from 'postgres';

import type { Category } from '~model/category.ts';
import { Global } from '~model/permission.ts';

import { Database } from '../../database.ts';

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
 * - `406` => content negotiation failed
 */
export async function handleGetAllCategories(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Category] Response content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
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
 * - `406` => content negotiation failed
 */
export async function handleCreateCategory(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Category] Response content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const ct = req.headers.get('Content-Type');
    if (!ct) {
        error(`[Category] No content type from session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct)
    if (mime !== 'text/plain') {
        error(`[Category] Bad media type ${mime} from session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
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

        if ((user.permission & Global.CreateCategory) === 0) {
            error(`[Category] User ${user.id} ${user.name} <${user.email}> cannot create new category "${category}"`);
            return new Response(null, { status: Status.Forbidden });
        }

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
 * - Accepts the target {@linkcode Category} ID via the `id` query parameter.
 * - Accepts the new {@linkcode Category} name as plaintext from the {@linkcode Request} body.
 *
 * # Outputs
 * - `204` => {@linkcode Category} successfully renamed
 * - `400` => {@linkcode Category} ID or name is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `404` => {@linkcode Category} ID does not exist
 * - `406` => content negotiation failed
 */
export async function handleRenameCategory(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const input = params.get('id');
    const cid = input ? parseInt(input, 10) : NaN;
    if (isNaN(cid)) {
        error(`[Category] Session ${sid} provided an empty target office ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const ct = req.headers.get('Content-Type');
    if (ct !== 'text/plain') {
        error(`[Category] Response content negotiation failed for ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct)
    if (mime !== 'text/plain') {
        error(`[Category] Bad media type ${mime} from session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    // TODO: validate whether this is a legal category name
    const name = await req.text();
    if (!name) {
        error(`[Category] Session ${sid} provided an invalid category schema`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const user = await db.getUserFromSession(sid);
        if (user === null) {
            error(`[Category] Invalid session`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((user.permission & Global.UpdateCategory) === 0) {
            error(`[Category] User ${user.id} ${user.name} <${user.email}> cannot rename category ${cid} to "${name}"`);
            return new Response(null, { status: Status.Forbidden });
        }

        if (await db.renameCategory({ id: cid, name })) {
            info(`[Category] User ${user.id} ${user.name} <${user.email}> renamed category ${cid} to "${name}"`);
            return new Response(null, { status: Status.NoContent });
        }

        error(`[Category] User ${user.id} ${user.name} <${user.email}> attempted to rename non-existent category ${cid} to "${name}"`);
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
 * - `202` => successful deprecation (i.e., not permanently deleted)
 * - `204` => successful deletion
 * - `400` => {@linkcode Category} ID is not an integer
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `404` => {@linkcode Category} ID does not exist
 * - `406` => content negotiation failed
 */
export async function handleDeleteCategory(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const input = params.get('id');
    const cid = input ? parseInt(input, 10) : NaN;
    if (isNaN(cid)) {
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

        if ((user.permission & Global.DeleteCategory) === 0) {
            error(`[Category] User ${user.id} ${user.name} <${user.email}> cannot delete category ${cid}`);
            return new Response(null, { status: Status.Forbidden });
        }

        const result = await db.deleteCategory(cid);
        if (result === null) {
            error(`[Category] User ${user.id} ${user.name} <${user.email}> attempted to delete non-existent category ${cid}`);
            return new Response(null, { status: Status.NotFound });
        }

        info(`[Category] User ${user.id} ${user.name} <${user.email}> deleted category ${cid} "${result}"`);
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
 * - `406` => content negotiation failed
 */
export async function handleActivateCategory(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'text/plain') === undefined) {
        error(`[Category] Response content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const input = params.get('id');
    const cid = input ? parseInt(input, 10) : NaN;
    if (isNaN(cid)) {
        error(`[Category] Invalid input from session ${sid}`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const operator = await db.getUserFromSession(sid);
        if (operator === null) {
            error(`[Category] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((operator.permission & Global.ActivateCategory) === 0) {
            error(`[Category] User ${operator.id} ${operator.name} <${operator.email}> cannot activate category ${cid}`);
            return new Response(null, { status: Status.Forbidden });
        }

        const name = await db.activateCategory(cid);
        if (name) {
            info(`[Category] User ${operator.id} ${operator.name} <${operator.email}> activated category ${cid} "${name}"`);
            return new Response(name, { headers: { 'Content-Type': 'text/plain' } });
        }

        error(`[Category] User ${operator.id} ${operator.name} <${operator.email}> attempted to delete non-existent category ${cid}`);
        return new Response(null, { status: Status.NotFound });
    } finally {
        db.release();
    }
}
