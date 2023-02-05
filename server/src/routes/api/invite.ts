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
