import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';

import { Database } from '../../database.ts';

/**
 * Sets the new permissions for a staff member.
 *
 * # Inputs
 * - Requires a valid session ID of an office administrator.
 * - Accepts the office ID of the session via the `office` query parameter.
 * - Accepts the new permission integer of the staff member via the `perms` query parameter.
 * - Accepts the user UUID in plaintext via the {@linkcode Request} body.
 *
 * # Outputs
 * - `204` => successfully updated the staff permissions
 * - `400` => `office` parameter, user UUID, or permissions is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `404` => staff member does not exist
 */
export async function handleSetStaffPermissions(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Staff] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const office = params.get('office');
    const oid = office ? parseInt(office, 10) : NaN;
    if (isNaN(oid)) {
        error(`[Staff] Session ${sid} provided invalid office ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const perms = params.get('perms');
    const setPerms = perms ? parseInt(perms, 10) : NaN;
    if (isNaN(setPerms)) {
        error(`[Staff] Session ${sid} provided invalid office ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const user = await req.text();
    if (!user) {
        error(`[Staff] Session ${sid} provided empty user ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const permissions = await db.getPermissionsFromSession(sid, oid);
        if (permissions === null) {
            error(`[Staff] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: Check permissions
        if (await db.setStaffPermissions(user, oid, setPerms)) {
            info(`[Category] Session ${sid} set the staff permissions of user ${user} in office ${oid} as ${setPerms}`);
            return new Response(null, { status: Status.NoContent });
        }

        error(`[Staff] Session ${sid} attempted to set the staff permissions of non-existent user ${user} in office ${oid} as ${setPerms}`);
        return new Response(null, { status: Status.NotFound });
    } finally {
        db.release();
    }
}

/**
 * Retires an existing member. Deletes it if no one references the staff member.
 *
 * # Inputs
 * - Requires a valid session ID of an office administrator.
 * - Accepts the office ID of the session via the `office` query parameter.
 * - Accepts the user UUID in plaintext via the {@linkcode Request} body.
 *
 * # Outputs
 * - `202` => successful retirement (i.e., not permanently deleted)
 * - `204` => successful deletion
 * - `400` => `office` parameter or user UUID is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `404` => staff member does not exist
 */
export async function handleRemoveStaff(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Staff] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const input = params.get('office');
    const oid = input ? parseInt(input, 10) : NaN;
    if (isNaN(oid)) {
        error(`[Staff] Session ${sid} provided invalid office ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const user = await req.text();
    if (!user) {
        error(`[Staff] Session ${sid} provided empty user ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const permissions = await db.getPermissionsFromSession(sid, oid);
        if (permissions === null) {
            error(`[Staff] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: Check permissions
        const result = await db.removeStaff(user, oid);
        if (result === null) {
            error(`[Staff] Session ${sid} attempted to retire staff member with non-existent user ${user} or office ${oid}`);
            return new Response(null, { status: Status.NotFound });
        }

        info(`[Category] Session ${sid} retired staff member with user ${user} and office ${oid}`);
        return new Response(null, { status: result ? Status.NoContent : Status.Accepted });
    } finally {
        db.release();
    }
}
