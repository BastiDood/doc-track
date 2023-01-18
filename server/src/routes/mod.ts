import { Status } from 'http';

import { handleLogin } from './auth/login.ts';
import { Database } from '../db/mod.ts';

export function get(db: Database, req: Request) {
    const { pathname } = new URL(req.url);
    switch (pathname) {
        case '/login': return handleLogin(db, req);
        default: return new Response(null, { status: Status.NotFound });
    }
}

export async function post(req: Request) {
    // TODO...
    throw new Error('todo');
}
