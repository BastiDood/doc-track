import { assert } from 'asserts';
import { getCookies } from 'cookie';
import { Status } from 'http';
import { Pool } from 'postgres';

import { Database } from '../../database.ts';

export async function handleCallback(pool: Pool, req: Request, params: URLSearchParams) {
    // Redirect to start of log-in flow if no session ID
    const { sid } = getCookies(req.headers);
    const db = await Database.fromPool(pool);
    if (!sid)
        return new Response(null, {
            headers: { Location: '/login' },
            status: Status.Found,
        });

    // Redirect to dashboard if already logged in
    if (await db.checkValidSession(sid))
        return new Response(null, {
            headers: { Location: '/dashboard' },
            status: Status.Found,
        });

    // TODO: upgrade the pending session
    const state = params.get('state');
    assert(state);
}
