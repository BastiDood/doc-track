import { assertInstanceOf } from 'asserts';
import { contentType } from 'content-type';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';
import { join, extname } from 'posix';

import {
    handleGetAllCategories,
    handleCreateCategory,
    handleRenameCategory,
    handleDeleteCategory,
} from './api/category.ts';
import { handleCreateOffice, handleUpdateOffice } from './api/office.ts';
import { handleRevokeInvitation } from './api/invite.ts';
import { handleSubscribe } from './api/subscribe.ts';
import { handleCallback, handleLogin, handleLogout } from './auth/mod.ts';

export async function handleGet(pool: Pool, req: Request) {
    const { pathname, searchParams } = new URL(req.url);
    switch (pathname) {
        case '/api/categories': return handleGetAllCategories(pool, req);
        case '/auth/login': return handleLogin(pool, req);
        case '/auth/callback': return handleCallback(pool, req, searchParams);
        case '/': {
            const path = '../client/dist' + join(pathname, 'index.html');
            const file = await Deno.open(path);
            return new Response(file.readable, {
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
        }
        default: break;

    }

    const mime = contentType(extname(pathname));
    if (!mime) {
        error(`[GET] Cannot determine MIME type of ${pathname}`);
        return new Response(null, { status: Status.NotFound });
    }

    const path = '../client/dist' + pathname;
    try {
        const file = await Deno.open(path);
        info(`[GET] Read static file ${path}`);
        return new Response(file.readable, { headers: { 'Content-Type': mime } });
    } catch (err) {
        assertInstanceOf(err, Deno.errors.NotFound);
        error(`[GET] ${pathname} not found`);
        return new Response(null, { status: Status.NotFound });
    }
}

export function handlePost(pool: Pool, req: Request) {
    const { pathname } = new URL(req.url);
    switch (pathname) {
        case '/api/category': return handleCreateCategory(pool, req);
        case '/api/subscribe': return handleSubscribe(pool, req);
        case '/api/office': return handleCreateOffice(pool, req);
        default:
            error(`[POST] ${pathname} not found`);
            return new Response(null, { status: Status.NotFound });
    }
}

export function handlePut(pool: Pool, req: Request) {
    const { pathname } = new URL(req.url);
    switch (pathname) {
        case '/api/category': return handleRenameCategory(pool, req);
        case '/api/office': return handleUpdateOffice(pool, req);
        default:
            error(`[PUT] ${pathname} not found`);
            return new Response(null, { status: Status.NotFound });
    }
}

export function handleDelete(pool: Pool, req: Request) {
    const { pathname, searchParams } = new URL(req.url);
    switch (pathname) {
        case '/api/category': return handleDeleteCategory(pool, req);
        case '/api/invite': return handleRevokeInvitation(pool, req, searchParams);
        case '/auth/logout': return handleLogout(pool, req);
        default:
            error(`[DELETE] ${pathname} not found`);
            return new Response(null, { status: Status.NotFound });
    }
}
