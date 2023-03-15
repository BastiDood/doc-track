import {
    assert,
    assertArrayIncludes,
    assertEquals,
    assertFalse,
    assertInstanceOf,
    assertStrictEquals,
    equal,
} from 'asserts';
import { encode } from 'base64url';
import { Pool } from 'postgres';
import { validate } from 'uuid';

import { BarcodeAssignmentError, InsertSnapshotError } from '~model/api.ts';
import { Status } from '~model/snapshot.ts';

import { Database } from './database.ts';
import { env } from './env.ts';

const options = {
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    hostname: env.PG_HOSTNAME,
    port: env.PG_PORT,
    database: env.PG_DATABASE,
};

Deno.test('full OAuth flow', async t => {
    const pool = new Pool(options, 1, false);
    const db = await Database.fromPool(pool);

    await t.step('setting unknown user and staff permissions', async () => {
        const bad = crypto.randomUUID();
        assertFalse(await db.setUserPermissions(bad, 1));
        assertFalse(await db.setStaffPermissions(bad, 0, 1));
    });

    await t.step('invalid inbox', async () => {
        const inbox = await db.getInbox(0);
        assertStrictEquals(inbox.length, 0);
    });

    const office = await db.createOffice('Test');
    await t.step('update office information', async () => {
        assertFalse(await db.updateOffice({ id: 0, name: 'Hello' }));
        assert(await db.updateOffice({ id: office, name: 'Hello' }));
    });

    await t.step('successfully revoke invites from the system', async () => {
        const email = 'world@up.edu.ph';
        const permission = 0;
        const creation = await db.upsertInvitation({
            office,
            email,
            permission,
        });
        assert(creation !== null);

        const result = await db.revokeInvitation(office, email);
        assert(result !== null);
        assertEquals(result, { permission, creation });
    });

    // Randomly generate an email for uniqueness
    const randomEmail = encode(crypto.getRandomValues(new Uint8Array(6)));
    assertStrictEquals(randomEmail.length, 8);

    const USER = {
        id: crypto.randomUUID(),
        name: 'Hello World',
        email: `${randomEmail}@up.edu.ph`,
        picture: 'https://cdn.google.com/hello.png',
        permission: 1,
    };

    await t.step('invalid retirement of staff', async () => {
        // Non-existent office, but valid user
        assertStrictEquals(await db.removeStaff(USER.id, 0), null);

        // Non-existent user, but valid office
        assertStrictEquals(await db.removeStaff(crypto.randomUUID(), office), null);
    });

    await t.step('invite user to an office', async t => {
        const invite = {
            office,
            email: USER.email,
            permission: USER.permission,
        };
        const creation = await db.upsertInvitation(invite);
        assert(creation !== null);

        await t.step('invalid revocation of invites', async () => {
            // Non-existent office and email
            assertStrictEquals(await db.revokeInvitation(0, 'user@example.com'), null);

            // Non-existent office, but valid email
            assertStrictEquals(await db.revokeInvitation(0, USER.email), null);

            // Non-existent email, but valid office
            assertStrictEquals(await db.revokeInvitation(office, 'user@example.com'), null);
        });

        await t.step('retirement of non-existent staff', async () => {
            // Example UUID of non-existent user
            const badUser = crypto.randomUUID();

            // Non-existent office and user
            assertStrictEquals(await db.removeStaff(badUser, 0), null);

            // Non-existent office, but valid user
            assertStrictEquals(await db.removeStaff(USER.id, 0), null);

            // Non-existent user, but valid office
            assertStrictEquals(await db.removeStaff(badUser, office), null);

            // Valid user and office
            assertStrictEquals(await db.removeStaff(USER.id, office), null);
        });

        await t.step('valid revocation', async () =>
            assertEquals(await db.revokeInvitation(office, USER.email), {
                creation,
                permission: USER.permission,
            }));

        await t.step('invite acceptance', async () => {
            const creation = await db.upsertInvitation(invite);
            assert(creation !== null);

            const result = await db.insertInvitedUser(USER);
            assert(result !== null);
            assertArrayIncludes(result, [ office ]);
            assertStrictEquals(await db.upsertInvitation({
                office,
                email: USER.email,
                permission: USER.permission,
            }), null);
        });
    });

    await t.step('non-existent session invalidation', async () =>
        assertStrictEquals(await db.invalidateSession(crypto.randomUUID()), null));

    await t.step('pending session invalidation', async () => {
        const { id, nonce, expiration } = await db.generatePendingSession();
        assert(validate(id));
        assertStrictEquals(nonce.length, 64);
        assert(new Date < expiration);

        assertFalse(await db.checkValidSession(id));
        assertStrictEquals(await db.getUserFromSession(id), null);
        assertStrictEquals(await db.getStaffFromSession(id, office), null);

        const result = await db.invalidateSession(id);
        assert(result !== null);
        assertEquals(result.data, { nonce, expiration });
    });

    const { id, nonce, expiration } = await db.generatePendingSession();
    await t.step('user OAuth flow', async () => {
        assert(validate(id));
        assertStrictEquals(nonce.length, 64);
        assert(new Date < expiration);

        assertFalse(await db.checkValidSession(id));
        assertStrictEquals(await db.getUserFromSession(id), null);
        assertStrictEquals(await db.getStaffFromSession(id, office), null);

        const old = await db.upgradeSession({
            id,
            user_id: USER.id,
            expiration,
        });
        assertEquals(old, { nonce, expiration });

        assert(await db.checkValidSession(id));
        assertEquals(await db.getUserFromSession(id), USER);
        assertEquals(await db.getStaffFromSession(id, office), {
            user_id: USER.id,
            permission: USER.permission,
        });
    });

    await t.step('setting user and staff permissions', async () => {
        assert(await db.setUserPermissions(USER.id, 0b111));
        assert(await db.setStaffPermissions(USER.id, office, 0b011));

        const user = await db.getUserFromSession(id);
        assertStrictEquals(user?.permission, 0b111);
        assertEquals(await db.getStaffFromSession(id, office), {
            user_id: USER.id,
            permission: 0b011,
        });
    });

    await t.step('category tests', async () => {
        assertStrictEquals(await db.activateCategory(0), null);
        assertStrictEquals(await db.deleteCategory(0), null);

        const first = 'Leave of Absence';
        const id = await db.createCategory(first);
        assert(id !== null);
        assertEquals(await db.activateCategory(id), first);
        assertArrayIncludes(await db.getActiveCategories(), [ { id, name: first } ]);

        const second = 'Request for Drop';
        assert(await db.renameCategory({ id, name: second }));
        assertEquals(await db.activateCategory(id), second);
        assertArrayIncludes(await db.getActiveCategories(), [ { id, name: second } ]);
        assert(await db.deleteCategory(id));

        assertStrictEquals(await db.activateCategory(id), null);
        assertStrictEquals(await db.deleteCategory(id), null);
    });

    const { id: batch, codes } = await db.generateBatch({ office, generator: USER.id });
    await t.step('batch generation', () => {
        assert(Number.isSafeInteger(batch));
        assert(batch > 0);
        assertStrictEquals(codes.length, 10);
        // TODO: Test if we are indeed the minimum batch
    });

    await t.step('valid retirement of staff (no deletion)', async () => {
        // Previous step created a batch that references the user,
        // so we expect that the user will simply lose permissions
        // rather than being completely deleted from the office.
        assertStrictEquals(await db.removeStaff(USER.id, office), false)
        assertEquals(await db.getStaffFromSession(id, office), {
            user_id: USER.id,
            permission: 0,
        });
    });

    await t.step('valid session invalidation', async () => {
        const result = await db.invalidateSession(id);
        assert(result !== null);
        assertEquals(result.data, {
            user_id: USER.id,
            expiration,
        });
    });

    // Randomly generate a category for uniqueness
    const randomCategory = encode(crypto.getRandomValues(new Uint8Array(14)));
    assertStrictEquals(randomCategory.length, 19);

    const category = await db.createCategory(randomCategory);
    assert(category !== null);

    const [ chosen, ...others ] = codes;
    assert(chosen);
    assertStrictEquals(others.length, 9);
    const doc = { id: chosen, category, title: 'DocTrack Team' };

    await t.step('document creation', async () => {
        // TODO: Test if we are indeed the minimum batch
        const snap = { evaluator: USER.id, remark: 'Hello' };
        const uuid = crypto.randomUUID();

        // Non-existent barcode
        assertEquals(await db.assignBarcodeToDocument({ ...doc, id: uuid }, snap), BarcodeAssignmentError.BarcodeNotFound);

        // Non-existent category
        assertEquals(await db.assignBarcodeToDocument({ ...doc, category: 0 }, snap), BarcodeAssignmentError.CategoryNotFound);

        // Non-existent evaluator
        assertEquals(await db.assignBarcodeToDocument(doc, { ...snap, evaluator: uuid }), BarcodeAssignmentError.EvaluatorNotFound);

        // Successful assignment
        const creation = await db.assignBarcodeToDocument(doc, snap);
        assertInstanceOf(creation, Date);

        // Paper trail should contain one snapshot
        assertEquals(await db.getPaperTrail(doc.id), [{
            status: Status.Register,
            creation,
            category: randomCategory,
            remark: snap.remark,
            target: null,
            name: USER.name,
            email: USER.email,
            picture: USER.picture,
            title: doc.title,
        }]);

        // Use already assigned barcode
        assertEquals(await db.assignBarcodeToDocument(doc, snap), BarcodeAssignmentError.AlreadyAssigned);
    });

    await t.step('snapshot insertion', async t => {
        // Valid snapshot
        const snapshot = {
            doc: chosen,
            target: office,
            evaluator: USER.id,
            status: Status.Send,
            remark: 'Hello world!',
        };

        await t.step('bad snapshots', async () => {
            // Non-existent document
            assertEquals(await db.insertSnapshot({ ...snapshot, doc: crypto.randomUUID() }), InsertSnapshotError.DocumentNotFound);

            // Non-existent target
            assertEquals(await db.insertSnapshot({ ...snapshot, target: 0 }), InsertSnapshotError.TargetNotFound);

            // Non-existent evaluator
            assertEquals(await db.insertSnapshot({ ...snapshot, evaluator: 'non-existent-user-id' }), InsertSnapshotError.EvaluatorNotFound);

            // Non-`Send` status with null target
            assertEquals(await db.insertSnapshot({ ...snapshot, status: Status.Send, target: null }), InsertSnapshotError.InvalidStatus);

            // `Send` status with non-null target
            assertEquals(await db.insertSnapshot({ ...snapshot, status: Status.Register }), InsertSnapshotError.InvalidStatus);
            assertEquals(await db.insertSnapshot({ ...snapshot, status: Status.Receive }), InsertSnapshotError.InvalidStatus);
            assertEquals(await db.insertSnapshot({ ...snapshot, status: Status.Terminate }), InsertSnapshotError.InvalidStatus);
        });

        // Valid document
        const creation = await db.insertSnapshot(snapshot);
        assertInstanceOf(creation, Date);

        await t.step('view latest snapshot in paper trail', async () => {
            const trail = await db.getPaperTrail(chosen);
            assertEquals(trail.at(-1), {
                status: Status.Send,
                creation,
                category: randomCategory,
                remark: snapshot.remark,
                target: office,
                name: USER.name,
                email: USER.email,
                picture: USER.picture,
                title: doc.title,
            });
        })

        await t.step('verify that the inbox only contains one document with the latest snapshot', async () => {
            const inbox = await db.getInbox(office);
            assertEquals(inbox, [{
                creation,
                category: randomCategory,
                doc: doc.id,
                title: doc.title,
            }]);
        });

        await t.step('user metrics are consistent', async () => {
            const metrics = await db.generateUserSummary(USER.id);
            assertStrictEquals(metrics.get(Status.Register), 1n);
            assertStrictEquals(metrics.get(Status.Send), 1n);
            assertStrictEquals(metrics.get(Status.Receive), undefined);
            assertStrictEquals(metrics.get(Status.Terminate), undefined);
        });
    });

    await t.step('category deprecation and activation', async () => {
        // Deprecation
        const result = await db.deleteCategory(category);
        assertStrictEquals(result, false);

        // Not in any of the active categories
        const active = await db.getActiveCategories();
        assertFalse(active.some(cat => equal(cat, { id: category, name: randomCategory })));

        // Activation
        const activation = await db.activateCategory(category);
        assertEquals(activation, randomCategory);
        assertArrayIncludes(await db.getActiveCategories(), [ { id: category, name: randomCategory } ]);
    });

    db.release();
    await pool.end();
});
