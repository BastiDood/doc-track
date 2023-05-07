import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { parseMediaType } from 'parse-media-type';
import { Pool } from 'postgres';

import type { InsertSnapshotError } from '~model/api.ts';
import { Local } from '~model/permission.ts';
import { type Snapshot, SnapshotSchema } from '~model/snapshot.ts';

import { Database } from '../../database.ts';

/**
 * Inserts a new document snapshot into the database.
 *
 * # Inputs
 * - Requires a valid session ID.
 * - Accepts the ID of the office to which the {@linkcode Snapshot} will be inserted via the `office` query parameter.
 * - Accepts the to-be-inserted {@linkcode Snapshot} (minus the `creation` and `evaluator` fields) via the {@linkcode Request} body.
 *
 * # Outputs
 * - `201` => returns {@linkcode Date} (as UTC milliseconds) in the {@linkcode Response} body if successful
 * - `400` => office ID or {@linkcode Snapshot} JSON is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session is invalid
 * - `406` => content negotiation failed
 * - `409` => returns error code as {@linkcode InsertSnapshotError} in JSON
 */
export async function handleInsertSnapshot(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Snapshot] Absent session');
        return new Response(null, { status: Status.Unauthorized });
    }

    const office = params.get('office');
    const oid = office ? parseInt(office, 10) : NaN;
    if (isNaN(oid)) {
        error(`[Snaphost] Session ${sid} provided invalid office ID`);
        return new Response(null, { status: Status.BadRequest });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Snapshot] Response content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const ct = req.headers.get('Content-Type');
    if (!ct) {
        error(`[Snapshot] Empty content type for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct);
    if (mime !== 'application/json') {
        error(`[Snapshot] Bad content type ${mime} from session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const result = SnapshotSchema.omit({ creation: true, evaluator: true }).safeParse(await req.json());
    if (!result.success) {
        error(`[Snapshot] Session ${sid} provided malformed document snapshot data`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const staff = await db.getStaffFromSession(sid, oid);
        if (staff === null) {
            error(`[Snapshot] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((staff.permission & Local.InsertSnapshot) === 0) {
            error(`[Snapshot] User ${staff.user_id} cannot insert ${result.data.status} snapshot for document ${result.data.doc} to ${result.data.target}`);
            return new Response(null, { status: Status.Forbidden });
        }

        // FIXME: make sure that we don't insert a new `Register` type
        const snap: Snapshot['creation'] | InsertSnapshotError = await db.insertSnapshot({ ...result.data, evaluator: staff.user_id });
        if (snap instanceof Date) {
            info(`[Snapshot] User ${staff.user_id} inserted ${result.data.status} snapshot for document ${result.data.doc} to ${result.data.target}`);
            return new Response(snap.getTime().toString(), {
                status: Status.Created,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        error(`[Snapshot] User ${staff.user_id} could not insert ${result.data.status} snapshot for document ${result.data.doc} to ${result.data.target} because error ${snap}`);
        return new Response(snap.toString(), {
            status: Status.Conflict,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }
}
