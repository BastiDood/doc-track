import { assert, assertEquals, assertNotStrictEquals, assertStrictEquals } from 'asserts';
import { encode as b64encode } from 'base64url';
import { equals as bytewiseEquals } from 'bytes';
import { Pool } from 'postgres';

import { Batch } from '~client/api/batch.ts';
import { Category } from '~client/api/category.ts';
import { Document } from '~client/api/document.ts';
import { Invite } from '~client/api/invite.ts';
import { Metrics } from '~client/api/metrics.ts';
import { Office } from '~client/api/office.ts';
import { Session } from '~client/api/session.ts';
import { Snapshot } from '~client/api/snapshot.ts';
import { Staff } from '~client/api/staff.ts';
import { User } from '~client/api/user.ts';
import { Vapid } from '~client/api/vapid.ts';

import { Global, Local } from '~model/permission.ts';

import { Database } from '~server/database.ts';
import { env } from '~server/env.ts';
import { handleRequest } from '~server/routes/mod.ts';

async function setup(pool: Pool) {
    const db = await Database.fromPool(pool);
    try {
        // Create mock office
        const oid = await db.createOffice('DocTrack');
        assertNotStrictEquals(oid, 0);

        // Randomly generate an email for uniqueness
        const randomEmail = b64encode(crypto.getRandomValues(new Uint8Array(6)));
        assertStrictEquals(randomEmail.length, 8);

        // Invite mock email to the system
        const email = `${randomEmail}@up.edu.ph`;
        const creation = await db.upsertInvitation({
            office: oid,
            permission: (Local.ViewInbox << 1) - 1,
            email,
        });
        assertNotStrictEquals(creation, null);

        // Construct mock user
        const user = {
            id: crypto.randomUUID(),
            name: 'Hello World',
            picture: 'https://doctrack.app/profile/user.png',
            permission: (Global.ViewMetrics << 1) - 1,
            email,
        };

        // Formally integrate user into the system
        const offices = await db.insertInvitedUser(user);
        assert(offices !== null);
        const [ first, ...rest ] = offices;
        assertStrictEquals(rest.length, 0);
        assertStrictEquals(first, oid);

        // Construct a full valid session
        const { id, nonce, expiration } = await db.generatePendingSession();
        const pending = await db.upgradeSession({
            id,
            user_id: user.id,
            expiration,
        });
        assert(pending !== null);
        assertEquals(pending.expiration, expiration);
        assert(bytewiseEquals(pending.nonce, nonce));
        return { oid, sid: id, user };
    } finally {
        db.release();
    }
}

Deno.test('full API integration test', async t => {
    const pool = new Pool({
        user: env.PG_USER,
        password: env.PG_PASSWORD,
        hostname: env.PG_HOSTNAME,
        port: env.PG_PORT,
        database: env.PG_DATABASE,
    }, 1, false);

    // Set up mock session
    const { oid, sid, user } = await setup(pool);

    // Mock the `fetch` function and its cookie store
    const origFetch = globalThis.fetch;
    globalThis.fetch = (input, init) => {
        const request = new Request('https://doctrack.app' + input, {
            ...init,
            headers: {
                Cookie: `sid=${sid}`,
                ...init?.headers,
            },
        });
        const response = handleRequest(pool, request);
        return response instanceof Response
            ? Promise.resolve(response)
            : response;
    };

    await t.step('VAPID wrappers', async () => {
        // Public key retrieval
        const key = new Uint8Array(await Vapid.getVapidPublicKey());
        assert(bytewiseEquals(key, env.VAPID_PUB_KEY));

        // Submit push subscription
        await Vapid.sendSubscription({
            endpoint: 'https://notifications.doctrack.app/123',
            keys: { auth: 'auth', p256dh: 'p256dh' },
            expirationTime: null,
        });
    });

    await t.step('Session API', async () => {
        const session = await Session.getUser();
        assertEquals(session, user);
    });

    await t.step('Invite API', async () => {
        // Add invitation
        const email = 'yo@up.edu.ph';
        const creation = await Invite.add({
            email,
            office: oid,
            permission: Local.AddStaff,
        });
        assertNotStrictEquals(creation, null);

        // Revoke invitation
        const result = await Invite.revoke({ email, office: oid });
        assertStrictEquals(result?.permission, Local.AddStaff);
        assertEquals(result.creation, creation);
    });

    // Restore the original fetch
    globalThis.fetch = origFetch;
    await pool.end();
});
