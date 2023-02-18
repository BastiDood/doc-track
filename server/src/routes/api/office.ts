import { getCookies } from 'cookie';
import { Status } from 'http';
import { error, info } from 'log';
import { Pool } from 'postgres';

import { type Office, OfficeSchema } from '~model/office.ts';

import { Database } from '../../database.ts';

/**
 * Creates a new office with a given name.
 *
 * # Inputs
 * - Requires a valid session ID of a system operator.
 * - Accepts the name of the new {@linkcode Office} as plaintext from the {@linkcode Request} body.
 *
 * # Outputs
 * - `201` => returns the ID of the successfully created {@linkcode Office}
 * - `400` => provided {@linkcode Office} name is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 */
export async function handleCreateOffice(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Office] Absent session');
        return new Response(null, { status: Status.Unauthorized });
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

        // TODO: check global permissions
        const office = await db.createOffice(name);
        info(`[Office] User ${operator.id} ${operator.name} <${operator.email}> created new office ${office} "${name}"`);
        return new Response(office.toString(), {
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
 * - Accepts the updated {@linkcode Office} details as JSON from the {@linkcode Request} body.
 *
 * # Outputs
 * - `204` => {@linkcode Office} successfully updated
 * - `400` => provided {@linkcode Office} is unacceptable
 * - `401` => session ID is absent, expired, or otherwise malformed
 * - `404` => requested {@linkcode Office} is non-existent
 */
export async function handleUpdateOffice(pool: Pool, req: Request) {
    const { sid } = getCookies(req.headers);
    if (!sid) {
        error('[Office] Absent session');
        return new Response(null, { status: Status.Unauthorized });
    }

    const result = OfficeSchema.safeParse(await req.json());
    if (!result.success) {
        error(`[Office] Session ${sid} provided malformed input`);
        return new Response(null, { status: Status.BadRequest });
    }

    const db = await Database.fromPool(pool);
    try {
        const operator = await db.getUserFromSession(sid);
        if (operator === null) {
            error(`[Office] Invalid session ${sid}`);
            return new Response(null, { status: Status.Unauthorized });
        }

        // TODO: check global permissions
        const office: Office = result.data;
        if (await db.updateOffice(office)) {
            info(`[Office] User ${operator.id} ${operator.name} <${operator.email}> updated office ${office.id} to "${office.name}"`);
            return new Response(null, { status: Status.NoContent });
        }

        error(`[Office] User ${operator.id} ${operator.name} <${operator.email}> attempted to update non-existent office ${office.id} to "${office.name}"`);
        return new Response(null, { status: Status.NotFound });
    } finally {
        db.release();
    }
}
