import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info, warning } from 'log';
import { Pool } from 'postgres';

import { Database } from '../../database.ts';

export async function handleLogout(pool: Pool, req: Request) {
    const headers = new Headers({ Location: '/' });

    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Logout] Attempted to log out without session');
        return new Response(null, { headers, status: Status.Found });
    }

    const db = await Database.fromPool(pool);
    try {
        const result = await db.invalidateSession(sid);
        if (result === null) error(`[Logout] Attempted to invalidate non-existent session ${sid}`);
        else if (result.valid) info(`[Logout] Successfully logged out session ${sid} for user ${result.data.user_id}`);
        else warning(`[Logout] Logged out pending session ${sid}`);
        return new Response(null, { headers, status: Status.Found });
    } finally {
        db.release();
    }
}
