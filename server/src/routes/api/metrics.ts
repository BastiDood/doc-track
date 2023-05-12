import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { Pool } from 'postgres';

import { Global, Local } from '~model/permission.ts';

import { Database } from '../../database.ts';

/**
 * Gets the summary of a user's metrics across all their offices.
 *
 * # Inputs
 * - Requires a session whose global permissions include {@linkcode Global.ViewMetrics}
 *
 * # Outputs
 * - `200` => returns the counts of the grouped snapshots as JSON in the {@linkcode Response} body
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => insufficient permissions
 * - `406` => content negotiation failed
 */
export async function handleGenerateUserSummary(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Metrics] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Metrics] Content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const db = await Database.fromPool(pool);
    try {
        const user = await db.getUserFromSession(sid);
        if (user === null) {
            error(`[Metrics] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((user.permission & Global.ViewMetrics) === 0) {
            error(`[Metrics] User ${user.id} ${user.name} <${user.email}> cannot view user-global summary`);
            return new Response(null, { status: Status.Forbidden });
        }

        const metrics = await db.generateUserSummary(user.id);
        info(`[Metrics] User ${user.id} ${user.name} <${user.email}> viewed user-global summary`);
        return new Response(JSON.stringify(metrics), {
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }
}

/**
 * Gets the summary of an office's metrics.
 *
 * # Inputs
 * - Requires a session whose local permissions include {@linkcode Local.ViewMetrics}
 *
 * # Outputs
 * - `200` => returns the counts of the grouped snapshots as JSON in the {@linkcode Response} body
 * - `400` => office ID is absent or otherwise malformed
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => insufficient permissions
 * - `406` => content negotiation failed
 */
export async function handleGenerateLocalSummary(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Metrics] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Metrics] Content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const input = params.get('id');
    if (!input) {
        error(`[Metrics] Session ${sid} provided an empty office ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    const oid = parseInt(input, 10);
    if (isNaN(oid)) {
        error(`[Metrics] Session ${sid} provided an invalid office ID "${input}"`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const staff = await db.getStaffFromSession(sid, oid);
        if (staff === null) {
            error(`[Metrics] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((staff.permission & Local.ViewMetrics) !== Local.ViewMetrics) {
            error(`[Metrics] Staff ${staff.user_id} of office ${oid} cannot view office summary`);
            return new Response(null, { status: Status.Forbidden });
        }

        const metrics = await db.generateLocalSummary(oid);
        info(`[Metrics] Staff ${staff.user_id} of office ${oid} viewed the office summary`);
        return new Response(JSON.stringify(metrics), {
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }
}

/**
 * Gets the summary of the entire system's metrics.
 *
 * # Inputs
 * - Requires a session whose global permissions include {@linkcode Global.ViewMetrics}
 *
 * # Outputs
 * - `200` => returns the counts of the grouped snapshots as JSON in the {@linkcode Response} body
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => insufficient permissions
 * - `406` => content negotiation failed
 */
export async function handleGenerateGlobalSummary(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Metrics] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Metrics] Content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const db = await Database.fromPool(pool);
    try {
        const user = await db.getUserFromSession(sid);
        if (user === null) {
            error(`[Metrics] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((user.permission & Global.ViewMetrics) !== Global.ViewMetrics) {
            error(`[Metrics] User ${user.id} ${user.name} <${user.email}> cannot view system summary`);
            return new Response(null, { status: Status.Forbidden });
        }

        const metrics = await db.generateGlobalSummary();
        info(`[Metrics] User ${user.id} ${user.name} <${user.email}> viewed system summary`);
        return new Response(JSON.stringify(metrics), {
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }
}

/**
 * Gets the summary of an office's barcode metrics.
 *
 * # Inputs
 * - Requires a session whose global permissions include {@linkcode Local.ViewMetrics}
 *
 * # Outputs
 * - `200` => returns the counts of the grouped snapshots as JSON in the {@linkcode Response} body
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => insufficient permissions
 * - `406` => content negotiation failed
 */
export async function handleGenerateBarcodeSummary(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Metrics] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const office = params.get('office');
    const oid = office ? parseInt(office, 10) : NaN;
    if (isNaN(oid)) {
        error(`[Metrics] Session ${sid} provided invalid office ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Metrics] Content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const db = await Database.fromPool(pool);
    try {
        const staff = await db.getStaffFromSession(sid, oid);
        if (staff === null) {
            error(`[Metrics] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((staff.permission & Global.ViewMetrics) === 0) {
            error(`[Metrics] Staff ${staff.user_id} from office ${oid} cannot view barcode metrics summary`);
            return new Response(null, { status: Status.Forbidden });
        }

        const bars = await db.generateBarcodeSummary(oid);
        info(`[Metrics] Staff ${staff.user_id} from office ${oid} cannot view barcode metrics summary`);
        return new Response(JSON.stringify(bars), {
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }
}
