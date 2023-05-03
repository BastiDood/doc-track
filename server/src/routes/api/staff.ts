import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { parseMediaType } from 'parse-media-type';
import { Pool } from 'postgres';

import { Local } from '~model/permission.ts';

import { Database } from '../../database.ts';

/**
 * Gets a list of the current staff members in an office.
 *
 * # Inputs
 * - Requires a valid session ID of an office staff member.
 * - Accepts the office ID of the session via the `office` query parameter.
 *
 * # Outputs
 * - `200` => list of resolved users
 * - `400` => `office` parameter is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `406` => content negotiation failed
 */
export async function handleGetStaff(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Staff] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Staff] Session ${sid} cannot accept JSON`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const office = params.get('office');
    const oid = office ? parseInt(office, 10) : NaN;
    if (isNaN(oid)) {
        error(`[Staff] Session ${sid} provided invalid office ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const staff = await db.getStaffFromSession(sid, oid);
        if (staff === null) {
            error(`[Staff] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        const mask = Local.AddStaff | Local.UpdateStaff | Local.RemoveStaff;
        if ((staff.permission & mask) === 0) {
            error(`[Category] User ${staff.user_id} cannot read the staff list in office ${oid}`);
            return new Response(null, { status: Status.Forbidden });
        }

        const members = await db.getStaff(oid);
        return new Response(JSON.stringify(members), {
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }

}

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
 * - `406` => content negotiation failed
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

    const ct = req.headers.get('Content-Type');
    if (!ct) {
        error(`[Staff] Empty content type for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct);
    if (mime !== 'text/plain') {
        error(`[Staff] Bad content type ${mime} from session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const user = await req.text();
    if (!user) {
        error(`[Staff] Session ${sid} provided empty user ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const staff = await db.getStaffFromSession(sid, oid);
        if (staff === null) {
            error(`[Staff] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((staff.permission & Local.UpdateStaff) === 0) {
            error(`[Category] User ${staff.user_id} cannot set the staff permissions of user ${user} in office ${oid} as ${setPerms}`);
            return new Response(null, { status: Status.Forbidden });
        }

        // FIXME: Prevent permission escalation
        if (await db.setStaffPermissions(user, oid, setPerms)) {
            info(`[Category] User ${staff.user_id} set the staff permissions of user ${user} in office ${oid} as ${setPerms}`);
            return new Response(null, { status: Status.NoContent });
        }

        error(`[Staff] User ${staff.user_id} attempted to set the staff permissions of non-existent user ${user} in office ${oid} as ${setPerms}`);
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
 * - `406` => content negotiation failed
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

    const ct = req.headers.get('Content-Type');
    if (!ct) {
        error(`[Staff] Empty content type for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct);
    if (mime !== 'text/plain') {
        error(`[Staff] Bad content type ${mime} from session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const user = await req.text();
    if (!user) {
        error(`[Staff] Session ${sid} provided empty user ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const staff = await db.getStaffFromSession(sid, oid);
        if (staff === null) {
            error(`[Staff] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((staff.permission & Local.RemoveStaff) === 0) {
            error(`[Category] User ${staff.user_id} cannot retire staff member with user ID ${user} in office ${oid}`);
            return new Response(null, { status: Status.Forbidden });
        }

        const result = await db.removeStaff(user, oid);
        if (result === null) {
            error(`[Staff] User ${staff.user_id} attempted to retire staff member with non-existent user ${user} or office ${oid}`);
            return new Response(null, { status: Status.NotFound });
        }

        info(`[Category] User ${staff.user_id} retired staff member with user ${user} and office ${oid}`);
        return new Response(null, { status: result ? Status.NoContent : Status.Accepted });
    } finally {
        db.release();
    }
}
