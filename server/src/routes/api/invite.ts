import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';

import { Database } from '../../database.ts';
import { type Invitation, InvitationSchema } from '../../model/db/invitation.ts';

/**
 * Revokes a pre-existing email invitation in the office.
 *
 * # Inputs
 * - Requires a valid session ID of a system operator.
 * - Accepts the user's current {@linkcode Office} ID via the `office` query parameter.
 * - Accepts the `office` and `email` of the {@linkcode Invitation} to revoke.
 *
 * # Outputs
 * - `200` => return JSON body containing `permission` and `creation` of the deleted {@linkcode Invitation}
 * - `400` => office query parameter or request body is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `404` => requested {@linkcode Invitation} is non-existent
 */
export async function handleRevokeInvitation(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Invite] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const office = params.get('office');
    if (!office) {
        error(`[Invite] Empty office name in the query for session ${sid}`);
        return new Response(null, { status: Status.BadRequest });
    }

    const oid = parseInt(office, 10);
    if (isNaN(oid)) {
        error(`[Invite] Malformed office name in the query for session ${sid}`);
        return new Response(null, { status: Status.BadRequest });
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
