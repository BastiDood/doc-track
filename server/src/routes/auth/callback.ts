import { assert } from 'asserts';
import { getCookies, setCookie } from 'cookie';
import { Status } from 'http';
import { Pool } from 'postgres';

import { hashUuid } from './util.ts';
import { Database } from '../../database.ts';
import { env } from '../../env.ts';
import { AuthorizationCode, TokenResponseSchema } from '../../model/oauth/google.ts';
import { DISCOVERY } from '../../model/oauth/openid.ts';

export async function handleCallback(pool: Pool, req: Request, params: URLSearchParams) {
    // Redirect to start of log-in flow if no session ID
    const { sid } = getCookies(req.headers);
    if (!sid)
        return new Response(null, {
            headers: { Location: '/login' },
            status: Status.Found,
        });

    // Redirect to dashboard if already logged in
    const db = await Database.fromPool(pool);
    if (await db.checkValidSession(sid))
        return new Response(null, {
            headers: { Location: '/dashboard' },
            status: Status.Found,
        });

    // Validate the `state` argument
    const state = params.get('state');
    assert(state);
    if (state != await hashUuid(sid))
        return new Response(null, { status: Status.Forbidden });

    // Exchange authorization code for tokens
    const code = AuthorizationCode.parse(params.get('code'));
    const body = new URLSearchParams({
        code,
        client_id: env.GOOGLE_ID,
        client_secret: env.GOOGLE_SECRET,
        redirect_uri: env.OAUTH_REDIRECT,
        grant_type: 'authorization_code',
    });
    const response = await fetch(DISCOVERY.token_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    assert(response.ok);
    const { access_token, id_token } = TokenResponseSchema.parse(await response.json());
    assert(id_token.exp > new Date);

    assert(id_token.email_verified);
    const offices = await db.insertInvitedUser({
        id: id_token.sub,
        name: id_token.name,
        email: id_token.email,
    });
    assert(offices !== null && offices.length > 0);

    // Upgrade the pending session
    await db.upgradeSession({
        id: sid,
        user_id: id_token.sub,
        expiration: id_token.exp,
        access_token,
    });

    // FIXME: release on all code paths
    db.release();

    // Set the new session cookie
    const headers = new Headers({ Location: '/dashboard' });
    setCookie(headers, {
        name: 'sid',
        value: sid,
        expires: id_token.exp,
        httpOnly: true,
        sameSite: 'Lax',
    });
    return new Response(null, {
        headers,
        status: Status.Found,
    });
}
