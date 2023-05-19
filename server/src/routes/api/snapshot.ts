import { encode as b64encode } from 'base64url';
import { getCookies } from 'cookie';
import { Status } from 'http';
import { critical, error, info, warning } from 'log';
import { accepts } from 'negotiation';
import { parseMediaType } from 'parse-media-type';
import { Pool } from 'postgres';
import { generatePushHTTPRequest } from 'webpush';

import { Local } from '~model/permission.ts';
import { SnapshotSchema } from '~model/snapshot.ts';

import { Database } from '../../database.ts';
import { env } from '../../env.ts';

/**
 * Inserts a new document snapshot into the database.
 *
 * # Inputs
 * - Requires a valid session ID.
 * - Accepts the ID of the office to which the snapshot will be inserted via the `office` query parameter.
 * - Accepts the to-be-inserted snapshot (minus the `creation` and `evaluator` fields) via the {@linkcode Request} body.
 *
 * # Outputs
 * - `201` => returns {@linkcode Date} (as UTC milliseconds) in the {@linkcode Response} body if successful
 * - `400` => office ID or snapshot JSON is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => session is invalid
 * - `406` => content negotiation failed
 * - `409` => returns error code as JSON
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
        const notif = await db.insertSnapshot({ ...result.data, evaluator: staff.user_id });
        if (typeof notif === 'number') {
            error(`[Snapshot] User ${staff.user_id} could not insert ${result.data.status} snapshot for document ${result.data.doc} to office ${result.data.target} because error ${notif}`);
            return new Response(notif.toString(), {
                status: Status.Conflict,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Send notification to the push service
        const subscriptions = await db.getSubscriptionsForDocument(result.data.doc);
        await Promise.allSettled(subscriptions.map(async sub => {
            const { endpoint, headers, body } = await generatePushHTTPRequest({
                applicationServerKeys: env.VAPID_CREDENTIALS,
                adminContact: env.VAPID_EMAIL,
                payload: JSON.stringify(notif),
                urgency: 'high',
                ttl: 10,
                target: {
                    endpoint: sub.endpoint,
                    keys: {
                        auth: b64encode(sub.auth),
                        p256dh: b64encode(sub.p256dh),
                    },
                },
            });

            const res = await fetch(endpoint, {
                method: 'POST',
                headers,
                body,
            });

            // https://web.dev/push-notifications-web-push-protocol/#response-from-push-service
            switch (res.status) {
                case Status.Created:
                    info(`[Snapshot] Notification ${endpoint} successfully dispatched`);
                    return;
                case Status.BadRequest:
                    critical(`[Snapshot] Notification ${endpoint} failed due to bad input`);
                    return;
                case Status.NotFound:
                    warning(`[Snapshot] Notification ${endpoint} already expired`);
                    break;
                case Status.Gone:
                    warning(`[Snapshot] Notification ${endpoint} already unsubscribed`);
                    break;
                case Status.RequestEntityTooLarge:
                    critical(`[Snapshot] Notification ${endpoint} failed due to payload size`);
                    return;
                case Status.TooManyRequests:
                    error(`[Snapshot] Notification ${endpoint} failed due to rate-limiting`);
                    // TODO: Implement retry logic
                    return;
                default:
                    critical(`[Snapshot] Notification ${endpoint} returned unexpected status code ${res.status} ${res.statusText}`);
                    console.error(res);
                    return;
            }
            await db.popSubscription(sub.endpoint);
        }));

        info(`[Snapshot] User ${staff.user_id} inserted ${result.data.status} snapshot for document ${result.data.doc} to ${result.data.target}`);
        return new Response(notif.creation.valueOf().toString(), {
            status: Status.Created,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        db.release();
    }
}
