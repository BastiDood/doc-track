import { assert, assertArrayIncludes, assertEquals } from 'asserts';
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

    const USER = {
        id: crypto.randomUUID(),
        name: 'Hello World',
        email: 'hello@up.edu.ph',
        permission: 0,
    };

    const office = await db.createOffice('Test');
    await t.step('update office information', async () => {
        assert(!(await db.updateOffice({ id: 0, name: 'Hello' })));
        assert(await db.updateOffice({ id: office, name: 'Hello' }));
    });

    await t.step('invite user to an office', async () => {
        const creation = await db.upsertInvitation({
            office,
            email: USER.email,
            permission: 0,
        });
        assert(new Date > creation);

        const result = await db.insertInvitedUser(USER);
        assert(result !== null);
        assertArrayIncludes(result, [ office ]);
    });

    await t.step('non-existent session invalidation', async () =>
        assertEquals(await db.invalidateSession(crypto.randomUUID()), null));

    await t.step('pending session invalidation', async () => {
        const { id, nonce, expiration } = await db.generatePendingSession();
        assert(validate(id));
        assertEquals(nonce.length, 64);
        assert(new Date < expiration);

        assert(!(await db.checkValidSession(id)));
        assertEquals(await db.getUserFromSession(id), null);
        assertEquals(await db.getPermissionsFromSession(id, office), null);

        const result = await db.invalidateSession(id);
        assert(result !== null);
        assertEquals(result.data, { nonce, expiration });
    });

    const access_token = 'access-token';
    const { id, nonce, expiration } = await db.generatePendingSession();
    await t.step('user OAuth flow', async () => {
        assert(validate(id));
        assertEquals(nonce.length, 64);
        assert(new Date < expiration);

        assert(!(await db.checkValidSession(id)));
        assertEquals(await db.getUserFromSession(id), null);
        assertEquals(await db.getPermissionsFromSession(id, office), null);

        const old = await db.upgradeSession({
            id,
            user_id: USER.id,
            expiration,
            access_token,
        });
        assertEquals(old, { nonce, expiration });

        assert(await db.checkValidSession(id));
        assertEquals(await db.getUserFromSession(id), USER);
        assertEquals(await db.getPermissionsFromSession(id, office), 0);
    });

    await t.step('valid session invalidation', async () => {
        const result = await db.invalidateSession(id);
        assert(result !== null);
        assertEquals(result.data, {
            user_id: USER.id,
            expiration,
            access_token,
        });
    });

    db.release();
    await pool.end();
});

Deno.test('database notifications', async t => {
    const pool = new Pool(options, 1, false);
    const db = await Database.fromPool(pool);

    const user1 = 'https://example.com?user=1';
    const user2 = 'https://example.com?user=2';

    await t.step('category tests', async () => {
        const first = 'Leave of Absence';
        const id = await db.createCategory(first);
        assertEquals(await db.getAllCategories(), [ { id, name: first } ]);

        const second = 'Request for Drop';
        assert(await db.renameCategory({ id, name: second }));
        assertEquals(await db.getAllCategories(), [ { id, name: second } ]);
        assertEquals(await db.deleteCategory(id), second);
    });

    // TODO: add documents

    const expirationTime = new Date;
    expirationTime.setDate(expirationTime.getDate() + 1);

    await t.step('register push subscriptions', async () => {
        await db.pushSubscription({
            endpoint: user1,
            expirationTime: null,
        });
        await db.pushSubscription({
            endpoint:user2,
            expirationTime,
        });
    });

    // TODO: hook subscriptions

    db.release();
    await pool.end();
})
