import { assertInstanceOf } from 'asserts';
import { contentType } from 'content-type';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';
import { join, extname } from 'posix';

import { handleGetEarliestAvailableBatch, handleGenerateBatch } from './api/batch.ts';
import {
    handleGetAllCategories,
    handleCreateCategory,
    handleRenameCategory,
    handleDeleteCategory,
    handleActivateCategory,
} from './api/category.ts';
import { handleRevokeInvitation } from './api/invite.ts';
import { handleCreateOffice, handleUpdateOffice } from './api/office.ts';
import { handleSubscribe, handleVapidPublicKey } from './api/vapid.ts';
import { handleCallback, handleLogin, handleLogout } from './auth/mod.ts';
import { handleSetStaffPermissions, handleRemoveStaff } from './api/staff.ts';
import { handleSetUserPermissions } from './api/user.ts';

export async function handleGet(pool: Pool, req: Request) {
    const { pathname, searchParams } = new URL(req.url);
    switch (pathname) {
        case '/api/batch': return handleGetEarliestAvailableBatch(pool, req);
        case '/api/categories': return handleGetAllCategories(pool, req);
        case '/api/vapid': return handleVapidPublicKey();
        case '/auth/login': return handleLogin(pool, req);
        case '/auth/callback': return handleCallback(pool, req, searchParams);
        case '/': {
            const path = '../client/dist' + join(pathname, 'index.html');
            const { readable } = await Deno.open(path);
            return new Response(readable, {
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
        const { readable } = await Deno.open(path);
        info(`[GET] Read static file ${path}`);
        return new Response(readable, { headers: { 'Content-Type': mime } });
    } catch (err) {
        assertInstanceOf(err, Deno.errors.NotFound);
        error(`[GET] ${pathname} not found`);
        return new Response(null, { status: Status.NotFound });
    }
}

export function handlePost(pool: Pool, req: Request) {
    const { pathname, searchParams } = new URL(req.url);
    switch (pathname) {
        case '/api/batch': return handleGenerateBatch(pool, req, searchParams);
        case '/api/category': return handleCreateCategory(pool, req);
        case '/api/office': return handleCreateOffice(pool, req);
        case '/api/vapid': return handleSubscribe(pool, req);
        default:
            error(`[POST] ${pathname} not found`);
            return new Response(null, { status: Status.NotFound });
    }
}

export function handlePatch(pool: Pool, req: Request) {
    const { pathname, searchParams } = new URL(req.url);
    switch (pathname) {
        case '/api/category': return handleActivateCategory(pool, req, searchParams);
        case '/api/staff': return handleSetStaffPermissions(pool, req, searchParams);
        case '/api/user': return handleSetUserPermissions(pool, req, searchParams);
        default:
            error(`[PATCH] ${pathname} not found`);
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
        case '/api/category': return handleDeleteCategory(pool, req, searchParams);
        case '/api/invite': return handleRevokeInvitation(pool, req, searchParams);
        case '/api/staff': return handleRemoveStaff(pool, req, searchParams);
        case '/auth/logout': return handleLogout(pool, req);
        default:
            error(`[DELETE] ${pathname} not found`);
            return new Response(null, { status: Status.NotFound });
    }
}
