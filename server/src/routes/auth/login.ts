import { getCookies, setCookie } from 'cookie';
import { Status } from 'http';

import { env } from '../../env.ts';
import { Database } from '../../db/mod.ts';
import { hashUuid } from './util.ts';

/**
 * Rejects users that already have a valid session in the database.
 * Generates a brand new session otherwise. Namely:
 *
 * 1. There is no session ID.
 * 2. Session ID is an empty string.
 * 3. Session ID points to a pending session.
 */
export async function handleLogin(db: Database, req: Request) {
    // Redirect valid sessions to dashboard
    const { sid } = getCookies(req.headers);
    if (sid && await db.checkValidSession(sid))
        return new Response(null, {
            headers: { Location: '/dashboard' },
            status: Status.Found,
        });

    // Otherwise generate the new session
    const { id, nonce, expiration } = await db.generatePendingSession();

    // Build the OAuth 2.0 redirection parameters
    const params = new URLSearchParams({
        state: await hashUuid(id),
        client_id: env.GOOGLE_ID,
        redirect_uri: env.OAUTH_REDIRECT,
        nonce: nonce.slice(2),
        access_type: 'offline',
        response_type: 'code',
        scope: 'openid name email picture',
        prompt: 'select_account',
        hd: env.HOSTED_GSUITE_DOMAIN,
    });
    const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString();

    // Generate the response headers
    const headers = new Headers({ Location: url });
    setCookie(headers, {
        name: 'sid',
        value: id,
        expires: expiration,
        httpOnly: true,
        sameSite: 'Lax',
    });
    return new Response(null, { headers });
}
