import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { accepts } from 'negotiation';
import { parseMediaType } from 'parse-media-type';
import { Pool } from 'postgres';

import { Global } from '~model/permission.ts';

import { Database } from '../../database.ts';

/**
 * Gets a list of all the offices in the system.
 *
 * # Inputs
 * - Requires a valid session ID of a staff member.
 *
 * # Outputs
 * - `200` => returns array of office objects
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => insufficient permissions
 * - `406` => content negotiation failed
 */
export async function handleGetAllOffices(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Office] Absent session');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error('[Office] Content negotiation failed');
        return new Response(null, { status: Status.NotAcceptable });
    }

    const db = await Database.fromPool(pool);
    try {
        const user = await db.getUserFromSession(sid);
        if (user === null) {
            error(`[Office] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((user.permission & Global.GetOffices) !== Global.GetOffices) {
            error(`[Office] User ${user.id} ${user.name} <${user.email}> cannot fetch list of offices`);
            return new Response(null, { status: Status.Forbidden });
        }

        const offices = await db.getAllOffices();
        info(`[Office] User ${user.id} ${user.name} <${user.email}> fetched list of offices`);
        return new Response(JSON.stringify(offices));
    } finally {
        db.release();
    }
}

/**
 * Creates a new office with a given name.
 *
 * # Inputs
 * - Requires a valid session ID of a system operator.
 * - Accepts the `name` of the new office as plaintext from the {@linkcode Request} body.
 *
 * # Outputs
 * - `201` => returns the ID of the successfully created office
 * - `400` => provided office name is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => user is not a system operator
 * - `406` => content negotiation failed
 */
export async function handleCreateOffice(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Office] Absent session');
        return new Response(null, { status: Status.Unauthorized });
    }

    if (accepts(req, 'application/json') === undefined) {
        error(`[Office] Response content negotiation failed for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const ct = req.headers.get('Content-Type');
    if (!ct) {
        error(`[Office] Empty content type for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct);
    if (mime !== 'text/plain') {
        error(`[Office] Bad content type ${mime} from session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const name = await req.text();
    if (!name) {
        error(`[Office] Session ${sid} failed to create office with empty name`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const operator = await db.getUserFromSession(sid);
        if (operator === null) {
            error(`[Office] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((operator.permission & Global.CreateOffice) === 0) {
            error(`[Office] User ${operator.id} ${operator.name} <${operator.email}> cannot create new office "${name}"`);
            return new Response(null, { status: Status.Forbidden });
        }

        const oid = await db.createOfficeWithSuperuser(operator.id, name);
        info(`[Office] User ${operator.id} ${operator.name} <${operator.email}> created new office ${oid} "${name}"`);
        return new Response(oid.toString(), {
            headers: { 'Content-Type': 'application/json' },
            status: Status.Created,
        });
    } finally {
        db.release();
    }
}

/**
 * Creates a new office with a given name.
 *
 * # Inputs
 * - Requires a valid session ID of a system operator.
 * - Accepts the target {@linkcode Office} ID via the `id` query parameter.
 * - Accepts the updated {@linkcode Office} name as plaintext via the {@linkcode Request} body.
 *
 * # Outputs
 * - `204` => {@linkcode Office} successfully updated
 * - `400` => provided {@linkcode Office} is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `403` => user is not a system operator
 * - `404` => requested {@linkcode Office} is non-existent
 * - `406` => content negotiation failed
 */
export async function handleUpdateOffice(pool: Pool, req: Request, params: URLSearchParams) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Office] Absent session');
        return new Response(null, { status: Status.Unauthorized });
    }

    const input = params.get('id');
    const oid = input ? parseInt(input, 10) : NaN;
    if (isNaN(oid)) {
        error(`[Office] Session ${sid} provided malformed input`);
        return new Response(null, { status: Status.BadRequest });
    }

    const ct = req.headers.get('Content-Type');
    if (!ct) {
        error(`[Office] Empty content type for session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const [ mime, _ ] = parseMediaType(ct);
    if (mime !== 'text/plain') {
        error(`[Office] Bad content type ${mime} from session ${sid}`);
        return new Response(null, { status: Status.NotAcceptable });
    }

    const name = await req.text();
    if (!name) {
        error(`[Office] Session ${sid} failed to create office with empty name`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const operator = await db.getUserFromSession(sid);
        if (operator === null) {
            error(`[Office] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        if ((operator.permission & Global.UpdateOffice) === 0) {
            error(`[Office] User ${operator.id} ${operator.name} <${operator.email}> cannot update office ${oid} to "${name}"`);
            return new Response(null, { status: Status.Forbidden });
        }

        if (await db.updateOffice({ id: oid, name })) {
            info(`[Office] User ${operator.id} ${operator.name} <${operator.email}> updated office ${oid} to "${name}"`);
            return new Response(null, { status: Status.NoContent });
        }

        error(`[Office] User ${operator.id} ${operator.name} <${operator.email}> attempted to update non-existent office ${oid} to "${name}"`);
        return new Response(null, { status: Status.NotFound });
    } finally {
        db.release();
    }
}
