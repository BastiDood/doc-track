import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';

import { type MinBatch, Database } from '../../database.ts';

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
