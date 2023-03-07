import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { Pool } from 'postgres';

import { Database } from '../../database.ts';

/**
 * Gets the user associated with a given session ID.
 *
 * # Inputs
 * - Requires a valid session ID.
 *
 * # Outputs
 * - `200` => returns the user information as JSON in the {@linkcode Response} body
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `406` => content negotiation failed
 */
export async function handleGetUserFromSession(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Session] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Session] Content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const db = await Database.fromPool(pool);
    try {
        const user = await db.getUserFromSession(sid);
        if (user === null) {
            error(`[Session] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        info(`[Session] Retrieved user ${user.id} from session ${sid}`);
        return new Response(JSON.stringify(user));
    } finally {
        db.release();
    }
}