import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { parseMediaType } from 'parse-media-type';
import { Pool } from 'postgres';

import { Database } from '../../database.ts';

/**
 * Sets the new permissions for a user.
 *
 * # Inputs
 * - Requires a valid session ID of an office administrator.
 * - Accepts the new permission integer of the user via the `perms` query parameter.
 * - Accepts the user UUID in plaintext via the {@linkcode Request} body.
 *
 * # Outputs
 * - `204` => successfully updated the staff permissions
 * - `400` => user UUID or permissions is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `404` => user does not exist
 * - `406` => content negotiation failed
 */
export async function handleSetUserPermissions(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[User] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const perms = params.get('perms');
    const setPerms = perms ? parseInt(perms, 10) : NaN;
    if (isNaN(setPerms)) {
        error(`[User] Session ${sid} provided invalid office ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const ct = req.headers.get('Content-Type');
    if (!ct) {
        error(`[User] Empty content type for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct);
    if (mime !== 'text/plain') {
        error(`[User] Bad content type ${mime} from session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const user = await req.text();
    if (!user) {
        error(`[User] Session ${sid} provided empty user ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const admin = await db.getUserFromSession(sid);
        if (admin === null) {
            error(`[User] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: Check permissions and escalation prevention
        if (await db.setUserPermissions(user, setPerms)) {
            info(`[User] User ${admin.id} ${admin.name} <${admin.email}> set the staff permissions of user ${user} as ${setPerms}`);
            return new Response(null, { status: Status.NoContent });
        }

        error(`[User] User ${admin.id} ${admin.name} <${admin.email}> attempted to set the staff permissions of non-existent user ${user} as ${setPerms}`);
        return new Response(null, { status: Status.NotFound });
    } finally {
        db.release();
    }
}
