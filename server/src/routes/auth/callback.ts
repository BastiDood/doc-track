import { decode } from 'base64url';
import { equals } from 'bytes';
import { getCookies, setCookie } from 'cookie';
import { critical, error, info, warning } from 'log';
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

        if (!response.ok) {
            critical(`[Callback] Google token endpoint returned status ${response.status}`);
            return new Response(null, { status: Status.InternalServerError });
        }

        info('[Callback] Fetched ID token from Google');
        const json = await response.json();
        const { id_token } = TokenResponseSchema.parse(json);
        const idToken = await parseJwt(id_token);

        if (idToken.exp <= new Date) {
            critical(`[Callback] Google token endpoint returned already expired token on ${idToken.exp.toUTCString()}`);
            return new Response(null, { status: Status.InternalServerError });
        }

        if (!idToken.email_verified) {
            critical(`[Callback] Google token endpoint returned unverified email ${idToken.email}`);
            return new Response(null, { status: Status.InternalServerError });
        }

        // TODO: somehow return offices to the user
        info('[Callback] Successfully parsed ID token from Google');
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
        const session = await db.upgradeSession({
            id: sid,
            user_id: idToken.sub,
            expiration: idToken.exp,
        });

        if (session === null) {
            critical(`[Callback] Pending session ${sid} cannot be upgraded`);
            return new Response(null, { status: Status.InternalServerError });
        }

        if (!equals(session.nonce, decode(idToken.nonce))) {
            critical(`[Callback] Session ${sid} nonce ${session.nonce} does not match with ID token nonce ${idToken.nonce}`);
            return new Response(null, { status: Status.InternalServerError });
        }

        // Set the new session cookie
        const headers = new Headers({ Location: '/dashboard' });
        setCookie(headers, {
            path: '/',
            name: 'sid',
            value: sid,
            expires: idToken.exp,
            httpOnly: true,
            sameSite: 'Lax',
        });
        console.log(headers.get('Set-Cookie'));
        return new Response(null, {
            headers,
            status: Status.Found,
        });
    } finally {
        db.release();
    }
}
