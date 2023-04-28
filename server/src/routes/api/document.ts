import { getCookies } from 'cookie';
import { parseMediaType } from 'parse-media-type';
import { Status } from 'http';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { Pool } from 'postgres';

import type { BarcodeAssignmentError, AllInbox, AllOutbox, PaperTrail } from '~model/api.ts';
import { Local } from '~model/permission.ts';

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

        const { remark, ...doc } = inputResult.data;
        if ((staff.permission & Local.CreateDocument) === 0) {
            error(`[Document] User ${staff.user_id} cannot assign barcode ${doc.id} to document "${doc.title}"`);
            return new Response(null, { status: Status.Forbidden });
        }

        const barcodeResult: Date | BarcodeAssignmentError = await db.assignBarcodeToDocument(doc, {
            remark,
            evaluator: staff.user_id,
            target: oid
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

/**
 * Gets the inbox of the current office.
 *
 * # Inputs
 * - Requires a valid session ID.
 * - Accepts the target office ID via the `office` query parameter.
 *
 * # Outputs
 * - `200` => returns array of {@linkcode InboxEntry} as JSON in the {@linkcode Response} body
 * - `400` => provided office ID or document information is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session has insufficient permissions
 * - `406` => content negotiation failed
 */
export async function handleGetInbox(pool: Pool, req: Request, params: URLSearchParams) {
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

    const db = await Database.fromPool(pool);
    try {
        const staff = await db.getStaffFromSession(sid, oid);
        if (staff === null) {
            error(`[Document] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((staff.permission & Local.ViewInbox) === 0) {
            error(`[Document] User ${staff.user_id} cannot retrieve the inbox for office ${oid}`);
            return new Response(null, { status: Status.Forbidden });
        }

        const inbox: AllInbox = await db.getInbox(oid);
        info(`[Document] User ${staff.user_id} retrieved the inbox for office ${oid}`);
        return new Response(JSON.stringify(inbox), {
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }
}

export async function handleGetOutbox(pool: Pool, req: Request, params: URLSearchParams) {
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

    const db = await Database.fromPool(pool);
    try {
        const staff = await db.getStaffFromSession(sid, oid);
        if (staff === null) {
            error(`[Document] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((staff.permission & Local.ViewInbox) === 0) {
            error(`[Document] User ${staff.user_id} cannot retrieve the inbox for office ${oid}`);
            return new Response(null, { status: Status.Forbidden });
        }

        const inbox: AllOutbox = await db.getOutbox(oid);
        info(`[Document] User ${staff.user_id} retrieved the inbox for office ${oid}`);
        return new Response(JSON.stringify(inbox), {
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }
}
/**
 * Creates a new document by assigning it an available barcode.
 *
 * # Inputs
 * - Accepts the document ID via the `doc` query parameter.
 *
 * # Outputs
 * - `200` => returns {@linkcode PaperTrail} array as JSON in the {@linkcode Response} body
 * - `400` => provided document ID is not a valid UUID
 * - `406` => content negotiation failed
 */
export async function handleGetPaperTrail(pool: Pool, req: Request, params: URLSearchParams) {
    const input = params.get('doc');
    const result = DocumentSchema.shape.id.safeParse(input);
    if (!result.success) {
        error(`[Document] Bad document ID ${input} encountered`);
        return new Response(null, { status: Status.BadRequest });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Document] Content negotiation failed for paper trail`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const db = await Database.fromPool(pool);
    try {
        const trail: PaperTrail[] = await db.getPaperTrail(result.data);
        return new Response(JSON.stringify(trail), {
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        db.release();
    }
}
