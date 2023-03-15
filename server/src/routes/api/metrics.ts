import { getCookies } from 'cookie';
import { Status } from 'http';
import { map } from 'itertools';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { Pool } from 'postgres';

import { Global } from '~model/permission.ts';

import { Database } from '../../database.ts';

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
