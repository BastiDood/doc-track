import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { Pool } from 'postgres';

import type { GeneratedBatch, MinBatch } from '~model/api.ts';
import { Local } from '~model/permission.ts';

import { Database } from '../../database.ts';

/**
 * Gets the earliest available batch of barcodes (relative to an office).
 *
 * # Inputs
 * - Requires a valid session ID.
 * - Accepts the ID of the office from which the batch originated via the `office` query parameter.
 *
 * # Outputs
 * - `200` => returns a {@linkcode MinBatch} as JSON in the {@linkcode Response} body
 * - `400` => office ID is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => insufficient permissions
 * - `404` => no batches have been generated yet
 * - `406` => content negotiation failed
 */
export async function handleGetEarliestAvailableBatch(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Batch] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Batch] Response content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const input = params.get('office');
    const oid = input ? parseInt(input, 10) : NaN;
    if (isNaN(oid)) {
        error(`[Batch] Session ${sid} provided an empty office query argument`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const staff = await db.getStaffFromSession(sid, oid);
        if (staff === null) {
            error(`[Batch] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((staff.permission & Local.ViewBatch) === 0) {
            error(`[Batch] Session ${sid} cannot view earliest batch`);
            return new Response(null, { status: Status.Forbidden });
        }

        const result: MinBatch | null = await db.getEarliestAvailableBatch(oid);
        if (result === null) {
            error(`[Batch] No batches available yet for session ${sid}`);
            return new Response(null, { status: Status.NotFound });
        }

        info(`[Batch] User ${staff.user_id} requested a list of ${result.codes.length} barcodes from batch ${result.batch}`);
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }
}

/**
 * Generates a new batch of barcodes.
 *
 * # Inputs
 * - Requires a valid session ID for an office administrator.
 * - Accepts the office ID to which the batch will be generated via the `office` query parameter.
 *
 * # Outputs
 * - `201` => returns the {@linkcode GeneratedBatch} as JSON in the {@linkcode Response} body
 * - `400` => query argument `office` is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient local permissions
 * - `406` => content negotiation failed
 */
export async function handleGenerateBatch(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Batch] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Batch] Response content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const input = params.get('office');
    const oid = input ? parseInt(input, 10) : NaN;
    if (isNaN(oid)) {
        error(`[Batch] Invalid input from session ${sid}`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const admin = await db.getStaffFromSession(sid, oid);
        if (admin === null) {
            error(`[Batch] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((admin.permission & Local.GenerateBatch) === 0) {
            error(`[Batch] User ${admin.user_id} cannot generate new batch of barcodes`);
            return new Response(null, { status: Status.Forbidden });
        }

        const batch: GeneratedBatch = await db.generateBatch({ office: oid, generator: admin.user_id });
        info(`[Batch] User ${admin.user_id} generated new batch ${batch.id} of ${batch.codes.length} barcodes`);
        return new Response(JSON.stringify(batch), {
            headers: { 'Content-Type': 'application/json' },
            status: Status.Created,
        });
    } finally {
        db.release();
    }
}
