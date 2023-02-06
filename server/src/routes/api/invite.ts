import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';

import { Database } from '../../database.ts';
import { type Invitation, InvitationSchema } from '../../model/db/invitation.ts';

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
        return new Response(null, { status: Status.OK });
    } finally {
        db.release();
    }
}
