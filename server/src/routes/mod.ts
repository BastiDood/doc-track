import { Status } from 'http';
import { Pool } from 'postgres';

import { handleCallback, handleLogin } from './auth/mod.ts';

export function get(pool: Pool, req: Request) {
    const { pathname, searchParams } = new URL(req.url);
    switch (pathname) {
        case '/login': return handleLogin(pool, req);
        case '/callback': return handleCallback(pool, req, searchParams);
        default: return new Response(null, { status: Status.NotFound });
    }
}

export function post(req: Request) {
    // TODO...
    return new Response(null, { status: Status.NotImplemented });
}
