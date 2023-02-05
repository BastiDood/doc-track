import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';

import { Database } from '../../database.ts';

export async function handleGetAllCategories(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const office = params.get('office');
    if (!office) {
        error('[Category] Absent office parameter');
        return new Response(null, { status: Status.BadRequest });
    }

    const oid = parseInt(office, 10);
    if (isNaN(oid)) {
        error('[Category] Malformed office parameter');
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const permissions = await db.getPermissionsFromSession(sid, oid);
        if (permissions === null) {
            error(`[Category] Invalid session ${sid}`);
            return new Response(null, { status: Status.BadRequest });
        }

        const categories = await db.getAllCategories();
        info('[Category] Fetched all categories');
        return new Response(JSON.stringify(categories));
    } finally {
        db.release();
    }
}

export async function handleCreateCategory(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Category] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    // TODO: validate whether this is a legal category name
    const category = await req.text();
    if (!category) {
        error('[Category] Empty category name');
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
        const id = await db.createCategory(category);
        info(`[Category] User ${user.id} ${user.name} <${user.email}> added new category ${id} "${category}"`);
        return new Response(id.toString(), { status: Status.Created });
    } finally {
        db.release();
    }
}
