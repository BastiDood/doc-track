import { getCookies } from 'cookie';
import { parseMediaType } from 'parse-media-type';
import { Status } from 'http';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { Pool } from 'postgres';

import type { BarcodeAssignmentError } from '~model/api.ts';

import { DocumentSchema } from '~model/document.ts';
import { SnapshotSchema } from '~model/snapshot.ts';

import { Database } from '../../database.ts';

/**
 * Creates a new document by assigning it an available barcode.
 *
 * # Inputs
 * - Requires a valid session ID.
 * - Accepts the target office ID via the `office` query parameter.
 * - Accepts the updated document's ID, title, category, and remarks as JSON via the {@linkcode Request} body.
 *
 * # Outputs
 * - `201` => returns `creation` time as JSON in the {@linkcode Response} body
 * - `400` => provided office ID or document information is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session is invalid
 * - `406` => content negotiation failed
 * - `409` => returns error code as {@linkcode BarcodeAssignmentError}
 */
export async function handleCreateDocument(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Document] Absent session ID');
        return new Response(null, { status: Status.Unauthorized });
    }

    const office = params.get('office');
    const oid = office ? parseInt(office, 10) : NaN;
    if (isNaN(oid)) {
        error(`[Document] Session ${sid} provided invalid office ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Document] Content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const ct = req.headers.get('Content-Type');
    if (!ct) {
        error(`[Document] Empty content type for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct);
    if (mime !== 'application/json') {
        error(`[Document] Content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const inputResult = DocumentSchema.and(SnapshotSchema.pick({ remark: true })).safeParse(await req.json());
    if (!inputResult.success) {
        error(`[Document] Bad document body for session ${sid}`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const staff = await db.getStaffFromSession(sid, oid);
        if (staff === null) {
            error(`[Document] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: check local permissions
        const { remark, ...doc } = inputResult.data;
        const barcodeResult: Date | BarcodeAssignmentError = await db.assignBarcodeToDocument(doc, {
            remark,
            evaluator: staff.user_id,
        });

        if (barcodeResult instanceof Date) {
            info(`[Document] User ${staff.user_id} assigned barcode ${doc.id} to document "${doc.title}"`);
            return new Response(barcodeResult.getUTCMilliseconds().toString(), {
                status: Status.Created,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        error(`[Document] User ${staff.user_id} failed to assign barcode ${doc.id} to document "${doc.title}" because code ${barcodeResult}`);
        return new Response(barcodeResult.toString(), {
            status: Status.Conflict,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }
}
