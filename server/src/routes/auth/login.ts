import { getCookies, setCookie } from 'cookie';
import { Status } from 'http';
import { Pool } from 'postgres';

import { hashUuid } from './util.ts';
import { Database } from '../../database.ts';
import { env } from '../../env.ts';
import { OAUTH_SCOPE } from '../../model/oauth/google.ts';

/**
 * Rejects users that already have a valid session in the database.
 * Such users are redirected to the dashboard (i.e., `/dashboard`).
 * Otherwise, the function generates a brand new session. The cases
 * when this occurs are enumerated below:
 *
 * 1. There is no session ID.
 * 2. Session ID is an empty string.
 * 3. Session ID points to a pending session.
 *
 * Once a pending session has been initialized, the user is
 * redirected to Google's OAuth 2.0 consent page.
 */
export async function handleLogin(pool: Pool, req: Request) {
    // Redirect valid sessions to dashboard
    const { sid } = getCookies(req.headers);
    const db = await Database.fromPool(pool);
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
        access_type: 'online',
        response_type: 'code',
        scope: OAUTH_SCOPE,
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
