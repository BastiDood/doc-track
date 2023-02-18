import { assert, assertEquals } from 'asserts';
import { decode } from 'base64url';
import { getCookies, setCookie } from 'cookie';
import { error, info, warning } from 'log';
import { Status } from 'http';
import { Pool } from 'postgres';

import { hashUuid, parseJwt } from './util.ts';
import { Database } from '../../database.ts';
import { env } from '../../env.ts';
import { AuthorizationCode, TokenResponseSchema } from '../../model/oauth/google.ts';
import { DISCOVERY } from '../../model/oauth/openid.ts';

export async function handleCallback(pool: Pool, req: Request, params: URLSearchParams) {
    // Redirect to start of log-in flow if no session ID
    const { sid } = getCookies(req.headers);
    if (!sid) {
        warning('[Callback] Absent session ID redirecting to login');
        return new Response(null, {
            headers: { Location: '/login' },
            status: Status.Found,
        });
    }

    const db = await Database.fromPool(pool);

    try {
        // Redirect to dashboard if already logged in
        if (await db.checkValidSession(sid)) {
            warning(`[Callback] Already valid session ${sid} redirecting to dashboard`);
            return new Response(null, {
                headers: { Location: '/dashboard' },
                status: Status.Found,
            });
        }

        // Validate the `state` argument
        const state = params.get('state');
        assert(state);
        if (state != await hashUuid(sid)) {
            error('[Callback] State parameter does not match');
            return new Response(null, { status: Status.Forbidden });
        }

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
        info('[Callback] Fetched ID token from Google');

        const json = await response.json();
        console.log(json);
        const { id_token } = TokenResponseSchema.parse(json);
        const idToken = await parseJwt(id_token);

        assert(idToken.exp > new Date);
        assert(idToken.email_verified);
        info('[Callback] Successfully parsed ID token from Google');

        // TODO: return offices to the user
        const offices = await db.insertInvitedUser({
            id: idToken.sub,
            name: idToken.name,
            email: idToken.email,
            picture: idToken.picture,
            permission: 0,
        });

        if (offices === null)
            info(`[Callback] Returning user ${idToken.sub} logged in`);
        else
            info(`[Callback] New user joined offices ${offices}`);

        // Upgrade the pending session
        const { nonce } = await db.upgradeSession({
            id: sid,
            user_id: idToken.sub,
            expiration: idToken.exp,
        });
        assertEquals(nonce, decode(idToken.nonce));

        // Set the new session cookie
        const headers = new Headers({ Location: '/dashboard' });
        setCookie(headers, {
            name: 'sid',
            value: sid,
            expires: idToken.exp,
            httpOnly: true,
            sameSite: 'Lax',
        });
        return new Response(null, {
            headers,
            status: Status.Found,
        });
    } finally {
        db.release();
    }
}
