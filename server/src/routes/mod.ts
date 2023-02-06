import { Status } from 'http';
import { Pool } from 'postgres';

import {
    handleGetAllCategories,
    handleCreateCategory,
    handleRenameCategory,
    handleDeleteCategory,
} from './api/category.ts';
import { handleCreateOffice } from './api/office.ts';
import { handleSubscribe } from './api/subscribe.ts';
import { handleCallback, handleLogin } from './auth/mod.ts';

export function handleGet(pool: Pool, req: Request) {
    const { pathname, searchParams } = new URL(req.url);
    switch (pathname) {
        case '/api/categories': return handleGetAllCategories(pool, req);
        case '/auth/login': return handleLogin(pool, req);
        case '/auth/callback': return handleCallback(pool, req, searchParams);
        default: return new Response(null, { status: Status.NotFound });
    }
}

export function handlePost(pool: Pool, req: Request) {
    const { pathname } = new URL(req.url);
    switch (pathname) {
        case '/api/category': return handleCreateCategory(pool, req);
        case '/api/subscribe': return handleSubscribe(pool, req);
        case '/api/office': return handleCreateOffice(pool, req);
        default: return new Response(null, { status: Status.NotFound });
    }
}

export function handlePut(pool: Pool, req: Request) {
    const { pathname } = new URL(req.url);
    switch (pathname) {
        case '/api/category': return handleRenameCategory(pool, req);
        default: return new Response(null, { status: Status.NotFound });
    }
}

export function handleDelete(pool: Pool, req: Request) {
    const { pathname } = new URL(req.url);
    switch (pathname) {
        case '/api/category': return handleDeleteCategory(pool, req);
        default: return new Response(null, { status: Status.NotFound });
    }
}
