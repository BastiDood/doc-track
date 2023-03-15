import { getCookies } from 'cookie';
import { Status } from 'http';
import { map } from 'itertools';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { Pool } from 'postgres';

import { Global } from '~model/permission.ts';

import { Database } from '../../database.ts';

/**
 * Gets the summary of a user's metrics across all their offices.
 *
 * # Inputs
 * - Requires a session whose global permissions include {@linkcode Global.ViewMetrics}
 *
 * # Outputs
 * - `200` => returns the counts of the grouped snapshots as JSON in the {@linkcode Response} body
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => insufficient permissions
 * - `406` => content negotiation failed
 */
export async function handleGenerateUserSummary(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Metrics] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Metrics] Content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const db = await Database.fromPool(pool);
    try {
        const user = await db.getUserFromSession(sid);
        if (user === null) {
            error(`[Metrics] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((user.permission & Global.ViewMetrics) === 0) {
            error(`[Metrics] User ${user.id} ${user.name} <${user.email}> cannot view user-global summary`);
            return new Response(null, { status: Status.Forbidden });
        }

        const metrics = await db.generateUserSummary(user.id);
        info(`[Metrics] User ${user.id} ${user.name} <${user.email}> viewed user-global summary`);

        const entries = map(metrics.entries(), ([ status, amount ]) => [ status, amount.toString() ] as const);
        const json = Object.fromEntries(entries);
        return new Response(JSON.stringify(json), {
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }
}
