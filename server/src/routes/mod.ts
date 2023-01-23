import { Status } from 'http';
import { Pool } from 'postgres';

import { handleSubscribe } from './subscribe.ts';
import { handleCallback, handleLogin } from './auth/mod.ts';

export function get(pool: Pool, req: Request) {
    const { pathname, searchParams } = new URL(req.url);
    switch (pathname) {
        case '/login': return handleLogin(pool, req);
        case '/callback': return handleCallback(pool, req, searchParams);
        default: return new Response(null, { status: Status.NotFound });
    }
}

export function post(pool: Pool, req: Request) {
    const { pathname } = new URL(req.url);
    switch (pathname) {
        case '/subscribe': return handleSubscribe(pool, req);
        default: return new Response(null, { status: Status.NotFound });
    }
}
