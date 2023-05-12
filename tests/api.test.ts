import {
    assert,
    assertArrayIncludes,
    assertEquals,
    assertExists,
    assertInstanceOf,
    assertNotStrictEquals,
    assertStrictEquals,
} from 'asserts';
import { encode as b64encode } from 'base64url';
import { equals as bytewiseEquals } from 'bytes';
import { Pool } from 'postgres';

import { Batch } from '~client/api/batch.ts';
import { Category } from '~client/api/category.ts';
import { Document } from '~client/api/document.ts';
import { InsufficientPermissions } from '~client/api/error.ts';
import { Invite } from '~client/api/invite.ts';
import { Metrics } from '~client/api/metrics.ts';
import { Office } from '~client/api/office.ts';
import { Session } from '~client/api/session.ts';
import { Snapshot } from '~client/api/snapshot.ts';
import { Staff } from '~client/api/staff.ts';
import { User } from '~client/api/user.ts';
import { Vapid } from '~client/api/vapid.ts';

import { Local } from '~model/permission.ts';
import { Status } from '~model/snapshot.ts';

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
        const permission = 4095;
        const email = `${randomEmail}@up.edu.ph`;
        const creation = await db.upsertInvitation({
            office: oid,
            permission,
            email,
        });
        assertExists(creation);

        // Construct mock user
        const user = {
            id: crypto.randomUUID(),
            name: 'Hello World',
            picture: 'https://doctrack.app/profile/user.png',
            email,
        };

        // Formally integrate user into the system
        const offices = await db.insertInvitedUser(user);
        assertExists(offices);
        const [ first, ...rest ] = offices;
        assertStrictEquals(rest.length, 0);
        assertEquals(first, { office: oid, permission });

        // Set as superuser
        assert(await db.setUserPermissions(user.id, 255));

        // Construct a full valid session
        const { id, nonce, expiration } = await db.generatePendingSession();
        const pending = await db.upgradeSession({
            id,
            user_id: user.id,
            expiration,
        });
        assertExists(pending);
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

    // Promote as superuser
    await t.step('User API', async () => {
        assertArrayIncludes(await User.getAll(), [ { ...user, permission: 511 } ]);
        assert(await User.setPermission({
            id: user.id,
            permission: 511,
        }));
        assertArrayIncludes(await User.getAll(), [ { ...user, permission: 511 } ]);
    });

    const otherOid = await Office.create('Test Office');
    await t.step('Office API', async () => {
        // Create new office
        assertNotStrictEquals(otherOid, 0);

        // Update existing office
        assert(await Office.update({ id: otherOid, name: 'New Test Office' }));
        const offices = await Office.getAll();
        assertStrictEquals(offices[otherOid], 'New Test Office');
    });

    await t.step('Invite API', async () => {
        // Add invitation
        const email = 'yo@up.edu.ph';
        const creation = await Invite.add({
            email,
            office: oid,
            permission: Local.AddStaff,
        });
        assertExists(creation);

        // List one invitation
        assertEquals(await Invite.getList(oid), [ { office: oid, creation, email, permission: Local.AddStaff } ]);

        // Revoke invitation
        const result = await Invite.revoke({ email, office: oid });
        assertStrictEquals(result?.permission, Local.AddStaff);
        assertEquals(result.creation, creation);
        assertEquals(await Invite.getList(oid), [ ]);
    });

    await t.step('Staff API - setting permissions', async () =>
        assert(await Staff.setPermission({
            office: oid,
            user_id: user.id,
            permission: 4095,
        }))
    );

    await t.step('Session API', async () => {
        const session = await Session.getUser();
        assertEquals(session, {
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            local_perms: {
                [oid]: 4095,
                [otherOid]: 4095,
            },
            global_perms: 511,
        });
    });

    const origCategories = await Category.getAll();
    await t.step('Category API - creation/deletion', async () => {
        // Create new category
        const cid = await Category.create('Leave of Absence');
        assertNotStrictEquals(cid, 0);

        // Rename existing category
        const cRandomRename = b64encode(crypto.getRandomValues(new Uint8Array(8)));
        assert(await Category.rename({id: cid, name: cRandomRename}));

        // Get active categories before deletion
        const oldCategories = await Category.getAll();
        assertArrayIncludes(oldCategories.active, [ ...origCategories.active, { id: cid, name: cRandomRename } ]);
        assertStrictEquals(oldCategories.retire.find(cat => cat.id === cid && cat.name === cRandomRename), undefined);

        // Delete existing category
        assert(await Category.remove(cid));
        assertEquals(await Category.getAll(), origCategories);
    });

    assertStrictEquals(await Batch.getEarliestBatch(oid), null);
    const { id: bid, codes, creation } = await Batch.generate(oid);
    await t.step('Batch API', () => {
        // Create new batch
        assertNotStrictEquals(bid, 0);
        assertStrictEquals(codes.length, 10);
        assert(new Date >= creation);

        // TODO: Test Getter for Earliest Batch
    });

    const cName = b64encode(crypto.getRandomValues(new Uint8Array(8)));
    const cid = await Category.create(cName);
    assertNotStrictEquals(cid, 0);

    const [ first, ...rest ] = codes;
    assert(first !== undefined);
    assertStrictEquals(rest.length, 9);

    await t.step('Document API', async () => {
        const initial = await Batch.getEarliestBatch(oid);
        assertInstanceOf(initial?.creation, Date);
        assert(new Date >= initial.creation);
        assertStrictEquals(initial.batch, bid);
        assertEquals(initial.codes, codes);

        // Dossier should be initially empty
        assertEquals(await Document.getDossier(oid), [ ]);

        for (const code of codes) {
            const batch = await Batch.getEarliestBatch(oid);
            assertInstanceOf(batch?.creation, Date);
            assertEquals(batch.creation, initial.creation);
            assertStrictEquals(batch.batch, initial.batch);

            const doc = await Document.create(
                oid,
                {
                    id: code,
                    title: 'Leave of Absence',
                    category: cid,
                },
                'This is a cool remark!'
            );
            assertInstanceOf(doc, Date);
            assert(new Date >= creation);

            const index: number = initial.codes.indexOf(code);
            assert(index >= 0);
            const [ extracted, ...rest ]: string[] = initial.codes.splice(index, 1);
            assertStrictEquals(rest.length, 0);
            assertStrictEquals(extracted, code);

            // Most recent entry in dossier should be this document
            const expected = { doc: code, title: 'Leave of Absence', creation: doc, category: cName };
            const dossier = await Document.getDossier(oid);
            assertEquals(dossier[0], expected);
        }

        // There should be no more available codes
        assertStrictEquals(await Batch.getEarliestBatch(oid), null);
    });

    await t.step('Snapshot API', async () => {
        const result = await Snapshot.insert(oid, {
            doc: first,
            target: otherOid,
            status: Status.Send,
            remark: 'Sending!',
        });
        assertInstanceOf(result, Date);
    });

    await t.step('Metrics API', async () => {
        const user = await Metrics.generateUserSummary();
        assertStrictEquals(user.Register, 10);
        assertStrictEquals(user.Send, 1);
        assertStrictEquals(user.Receive, undefined);
        assertStrictEquals(user.Terminate, undefined);

        // TODO: add tests for multiple users in the same office

        const local = await Metrics.generateLocalSummary(oid);
        assertStrictEquals(local.Register, 10);
        assertStrictEquals(local.Send, 1);
        assertStrictEquals(local.Receive, undefined);
        assertStrictEquals(local.Terminate, undefined);

        const global = await Metrics.generateGlobalSummary();
        assert(global.Register ?? 0 > 0);
        assert(global.Send ?? 0 > 0);
        assertStrictEquals(global.Receive, undefined);
        assertStrictEquals(global.Terminate, undefined);

        const { assigned, pending } = await Metrics.generateBarcodeSummary(oid);
        assertStrictEquals(assigned, 10);
        assertStrictEquals(pending, 0);
    });

    await t.step('Category API - retirement', async () => {
        // Retire existing category
        assertStrictEquals(await Category.remove(cid), false);

        // Get active categories after deletion
        const newCategories = await Category.getAll();
        assertStrictEquals(newCategories.active.find(cat => cat.id === cid), undefined);
        assertNotStrictEquals(newCategories.retire.find(cat => cat.id === cid), undefined);

        // Reactivate retired category
        assertStrictEquals(await Category.activate(cid), cName);

        // Get active categories before deletion
        const oldCategories = await Category.getAll();
        assertNotStrictEquals(oldCategories.active.find(cat => cat.id === cid), undefined);
        assertStrictEquals(oldCategories.retire.find(cat => cat.id === cid), undefined);
    });

    await t.step('Staff API - retirement', async () => {
        assertEquals(await Staff.get(oid), [ { ...user, permission: 4095 } ]);
        const result = await Staff.remove({
            office: oid,
            user_id: user.id,
        });
        assertStrictEquals(result, false);

        // Staff is now retired; must still be in the staff list with zeroed permissions
        try {
            // Should throw because we no longer have permissions
            await Staff.get(oid);
        } catch (err) {
            assertInstanceOf(err, InsufficientPermissions);
        }

        // TODO: Test full removal of user
    });

    // Restore the original fetch
    globalThis.fetch = origFetch;
    await pool.end();
});
