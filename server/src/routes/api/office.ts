import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';

import { Database } from '../../database.ts';
import { type Office, OfficeSchema } from '../../model/db/office.ts';

/**
 * Creates a new office with a given name.
 *
 * # Inputs
 * - Requires a valid session ID of a system operator.
 * - Accepts the name of the new {@linkcode Office} as plaintext from the {@linkcode Request} body.
 *
 * # Outputs
 * - `201` => returns the ID of the successfully created {@linkcode Office}
 * - `400` => provided {@linkcode Office} name is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 */
export async function handleCreateOffice(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Office] Absent session');
        return new Response(null, { status: Status.Unauthorized });
    }

    const name = await req.text();
    if (!name) {
        error(`[Office] Session ${sid} failed to create office with empty name`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const user = await db.getUserFromSession(sid);
        if (user === null) {
            error(`[Office] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: check global permissions
        const office = await db.createOffice(name);
        info(`[Office] User ${user.id} ${user.name} <${user.email}> created new office ${office} "${name}"`);
        return new Response(office.toString(), { status: Status.Created });
    } finally {
        db.release();
    }
}
