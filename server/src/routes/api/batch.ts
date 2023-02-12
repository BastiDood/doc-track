import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';

import { type GeneratedBatch, type MinBatch, Database } from '../../database.ts';

/**
 * Gets the earliest available batch of barcodes.
 *
 * # Inputs
 * - Requires a valid session ID.
 *
 * # Outputs
 * - `200` => returns a {@linkcode MinBatch} as JSON in the {@linkcode Response} body
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `404` => no batches have been generated yet
 */
export async function handleGetEarliestAvailableBatch(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Batch] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const db = await Database.fromPool(pool);
    try {
        const valid = await db.checkValidSession(sid);
        if (!valid) {
            error(`[Batch] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        const result: MinBatch | null = await db.getEarliestAvailableBatch();
        if (result === null) {
            error(`[Batch] No batches available yet for session ${sid}`);
            return new Response(null, { status: Status.NotFound });
        }

        info(`[Batch] Session ${sid} requested a list of ${result.codes.length} barcodes from batch ${result.batch}`);
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
 */
export async function handleGenerateBatch(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Batch] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const input = params.get('office');
    const office = input ? parseInt(input, 10) : NaN;
    if (isNaN(office)) {
        error(`[Batch] Invalid input from session ${sid}`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const admin = await db.getUserFromSession(sid);
        if (admin === null) {
            error(`[Batch] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: Check Permissions
        const batch: GeneratedBatch = await db.generateBatch({ office, generator: admin.id });
        info(`[Batch] User ${admin.id} ${admin.name} <${admin.email}> generated new batch ${batch.id} of ${batch.codes.length} barcodes`);
        return new Response(JSON.stringify(batch), {
            headers: { 'Content-Type': 'application/json' },
            status: Status.Created,
        });
    } finally {
        db.release();
    }
}
