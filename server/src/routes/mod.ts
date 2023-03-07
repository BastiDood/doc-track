import { assertInstanceOf } from 'asserts';
import { contentType } from 'content-type';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';
import { resolve, join } from 'path';
import { extname } from 'posix';

import { handleGetEarliestAvailableBatch, handleGenerateBatch } from './api/batch.ts';
import {
    handleGetAllCategories,
    handleCreateCategory,
    handleRenameCategory,
    handleDeleteCategory,
    handleActivateCategory,
} from './api/category.ts';
import { handleCreateDocument, handleGetInbox, handleGetPaperTrail } from './api/document.ts';
import { handleAddInvitation, handleRevokeInvitation } from './api/invite.ts';
import { handleCreateOffice, handleUpdateOffice } from './api/office.ts';
import { handleSubscribe, handleVapidPublicKey } from './api/vapid.ts';
import { handleCallback, handleLogin, handleLogout } from './auth/mod.ts';
import { handleInsertSnapshot } from './api/snapshot.ts';
import { handleGetUserFromSession } from './api/session.ts';
import { handleSetStaffPermissions, handleRemoveStaff } from './api/staff.ts';
import { handleSetUserPermissions } from './api/user.ts';

const STATIC_ROOT = resolve(Deno.cwd(), '../client/dist');
info(`[Static] file server hosted at ${STATIC_ROOT}`);

export async function handleGet(pool: Pool, req: Request) {
    const { pathname, searchParams } = new URL(req.url);
    switch (pathname) {
        case '/api/batch': return handleGetEarliestAvailableBatch(pool, req, searchParams);
        case '/api/categories': return handleGetAllCategories(pool, req);
        case '/api/document': return handleGetPaperTrail(pool, req, searchParams);
        case '/api/inbox': return handleGetInbox(pool, req, searchParams);
        case '/api/session': return handleGetUserFromSession(pool, req);
        case '/api/vapid': return handleVapidPublicKey();
        case '/auth/login': return handleLogin(pool, req);
        case '/auth/callback': return handleCallback(pool, req, searchParams);
        case '/':
        case '/dashboard': {
            const { readable } = await Deno.open(STATIC_ROOT + pathname + '/index.html');
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

    const path = join(STATIC_ROOT, pathname);
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
        case '/api/document': return handleCreateDocument(pool, req, searchParams);
        case '/api/office': return handleCreateOffice(pool, req);
        case '/api/snapshot': return handleInsertSnapshot(pool, req, searchParams);
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
    const { pathname, searchParams } = new URL(req.url);
    switch (pathname) {
        case '/api/category': return handleRenameCategory(pool, req, searchParams);
        case '/api/invite': return handleAddInvitation(pool, req, searchParams);
        case '/api/office': return handleUpdateOffice(pool, req, searchParams);
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
