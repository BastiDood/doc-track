import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { parseMediaType } from 'parse-media-type';
import { Pool } from 'postgres';

import { type Invitation, InvitationSchema } from '~model/invitation.ts';

import { Database } from '../../database.ts';

/**
 * Adds a new email invitation to the office.
 *
 * # Inputs
 * - Requires a valid session ID of an office administrator.
 * - Accepts the admin's current {@linkcode Office} ID via the `office` query parameter.
 * - Accepts the `email` and `permission` via JSON in the {@linkcode Request} body.
 *
 * # Outputs
 * - `200` => return JSON body containing `permission` and `creation` of the deleted {@linkcode Invitation}
 * - `400` => office query parameter or request body is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `406` => content negotiation failed
 * - `409` => `email` already exists for some valid user
 */
export async function handleAddInvitation(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Invite] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const input = params.get('office');
    const office = input ? parseInt(input, 10) : NaN;
    if (isNaN(office)) {
        error(`[Invite] Empty office name in the query for session ${sid}`);
        return new Response(null, { status: Status.BadRequest });
    }

    if (accepts(req, 'application/json') !== undefined) {
        error(`[Invite] Content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const ct = req.headers.get('Content-Type');
    if (!ct) {
        error(`[Invite] Empty content type from session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct);
    if (mime !== 'application/json') {
        error(`[Invite] Bad content type ${mime} from session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const inputResult = InvitationSchema.pick({ email: true, permission: true }).safeParse(await req.json());
    if (!inputResult.success) {
        error(`[Invite] Session ${sid} provided malformed input in the body`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const permissions = await db.getPermissionsFromSession(sid, office);
        if (permissions === null) {
            error(`[Invite] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: check local permissions
        const { email, permission }: Pick<Invitation, 'email' | 'permission'> = inputResult.data;
        const creation = await db.upsertInvitation({ office, email, permission });
        if (creation === null) {
            error(`[Invite] Session ${sid} attempted to invite existing email <${email}> to office ${office}`);
            return new Response(null, { status: Status.Conflict });
        }

        info(`[Invite] Session ${sid} added invitation <${email}> to office ${office}`);
        return new Response(creation.getUTCMilliseconds().toString(), {
            headers: { 'Content-Type': 'application/json' },
            status: Status.OK,
        });
    } finally {
        db.release();
    }
}

/**
 * Revokes a pre-existing email invitation in the office.
 *
 * # Inputs
 * - Requires a valid session ID of an office administrator.
 * - Accepts the user's current {@linkcode Office} ID via the `office` query parameter.
 * - Accepts the `office` and `email` of the {@linkcode Invitation} to revoke as JSON in the {@linkcode Request} body.
 *
 * # Outputs
 * - `200` => return JSON body containing `permission` and `creation` of the deleted {@linkcode Invitation}
 * - `400` => office query parameter or request body is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `404` => requested {@linkcode Invitation} is non-existent
 * - `406` => content negotiation failed
 */
export async function handleRevokeInvitation(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Invite] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const input = params.get('office');
    const oid = input ? parseInt(input, 10) : NaN;
    if (isNaN(oid)) {
        error(`[Invite] Empty office name in the query for session ${sid}`);
        return new Response(null, { status: Status.BadRequest });
    }

    if (accepts(req, 'application/json') !== undefined) {
        error(`[Invite] Content negotiation failed for for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const ct = req.headers.get('Content-Type');
    if (!ct) {
        error(`[Invite] Empty content type for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct);
    if (mime !== 'application/json') {
        error(`[Invite] Bad content type ${mime} for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const inputResult = InvitationSchema.pick({ office: true, email: true }).safeParse(await req.json());
    if (!inputResult.success) {
        error(`[Invite] Session ${sid} provided malformed input in the body`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const permissions = await db.getPermissionsFromSession(sid, oid);
        if (permissions === null) {
            error(`[Invite] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: check local permissions
        const { office, email }: Pick<Invitation, 'office' | 'email'> = inputResult.data;
        const revokeResult = await db.revokeInvitation(office, email);
        if (revokeResult === null) {
            error(`[Invite] Session ${sid} attempted to revoke non-existent invitation <${email}> from office ${office}`);
            return new Response(null, { status: Status.NotFound });
        }

        info(`[Invite] Session ${sid} revoked invitation <${email}> from office ${office}`);
        return new Response(JSON.stringify(revokeResult), {
            headers: { 'Content-Type': 'application/json' },
            status: Status.OK,
        });
    } finally {
        db.release();
    }
}
