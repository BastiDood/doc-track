import { assert, assertArrayIncludes, assertEquals, assertStrictEquals, equal } from 'asserts';
import { encode } from 'base64url';
import { Pool } from 'postgres';
import { validate } from 'uuid';

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
        assert(!await db.setUserPermissions(bad, 1));
        assert(!await db.setStaffPermissions(bad, 0, 1));
    });

    const office = await db.createOffice('Test');
    await t.step('update office information', async () => {
        assert(!await db.updateOffice({ id: 0, name: 'Hello' }));
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

        assert(!(await db.checkValidSession(id)));
        assertStrictEquals(await db.getUserFromSession(id), null);
        assertStrictEquals(await db.getPermissionsFromSession(id, office), null);

        const result = await db.invalidateSession(id);
        assert(result !== null);
        assertEquals(result.data, { nonce, expiration });
    });

    const { id, nonce, expiration } = await db.generatePendingSession();
    await t.step('user OAuth flow', async () => {
        assert(validate(id));
        assertStrictEquals(nonce.length, 64);
        assert(new Date < expiration);

        assert(!(await db.checkValidSession(id)));
        assertStrictEquals(await db.getUserFromSession(id), null);
        assertStrictEquals(await db.getPermissionsFromSession(id, office), null);

        const old = await db.upgradeSession({
            id,
            user_id: USER.id,
            expiration,
        });
        assertEquals(old, { nonce, expiration });

        assert(await db.checkValidSession(id));
        assertEquals(await db.getUserFromSession(id), USER);
        assertStrictEquals(await db.getPermissionsFromSession(id, office), USER.permission);
    });

    await t.step('setting user and staff permissions', async () => {
        assert(await db.setUserPermissions(USER.id, 0b111));
        assert(await db.setStaffPermissions(USER.id, office, 0b011));

        const user = await db.getUserFromSession(id);
        assertStrictEquals(user?.permission, 0b111);
        assertStrictEquals(await db.getPermissionsFromSession(id, office), 0b011);
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
        assertStrictEquals(await db.getPermissionsFromSession(id, office), 0);
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

    await t.step('document creation', async () => {
        const [ chosen, ...others ] = codes;
        assert(chosen);
        assertStrictEquals(others.length, 9);

        assert(await db.assignBarcodeToDocument({ id: chosen, category, title: 'DocTrack Team' }));
        // TODO: Test if we are indeed the minimum batch
    });

    await t.step('category deprecation and activation', async () => {
        // Deprecation
        const result = await db.deleteCategory(category);
        assertStrictEquals(result, false);

        // Not in any of the active categories
        const active = await db.getActiveCategories();
        assert(!active.some(cat => equal(cat, { id: category, name: randomCategory })));

        // Activation
        const activation = await db.activateCategory(category);
        assertEquals(activation, randomCategory);
        assertArrayIncludes(await db.getActiveCategories(), [ { id: category, name: randomCategory } ]);
    });

    db.release();
    await pool.end();
});
