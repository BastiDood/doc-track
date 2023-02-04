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

Deno.test('database OAuth flow', async t => {
    const pool = new Pool(options, 1, true);
    const db = await Database.fromPool(pool);

    const USER = {
        id: crypto.randomUUID(),
        name: 'Hello World',
        email: 'hello@up.edu.ph',
    };

    await t.step('invite user to an office', async () => {
        const office = await db.createOffice('Test');
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

    await t.step('user OAuth flow', async () => {
        const { id, nonce, expiration } = await db.generatePendingSession();
        assert(validate(id));
        assertEquals(nonce.length, 64);
        assert(new Date < expiration);


        assert(!(await db.checkValidSession(id)));
        assertEquals(await db.getUserFromSession(id), null);
        assertEquals(await db.getPendingSessionNonce(id), nonce);

        await db.upgradeSession({
            id,
            user_id: USER.id,
            expiration,
            access_token: 'access-token',
        });

        assert(await db.checkValidSession(id));
        assertEquals(await db.getUserFromSession(id), { name: USER.name, email: USER.email });
        assertEquals(await db.getPendingSessionNonce(id), new Uint8Array);
    });

    db.release();
    await pool.end();
});

Deno.test('database notifications', async t => {
    const pool = new Pool(options, 1, true);
    const db = await Database.fromPool(pool);

    const user1 = 'https://example.com?user=1';
    const user2 = 'https://example.com?user=2';

    // TODO: add documents

    await t.step('register push subscriptions', async () => {
        await db.pushSubscription({
            endpoint: user1,
            expirationTime: null,
        });
        await db.pushSubscription({
            endpoint:user2,
            expirationTime: new Date,
        });
    });

    // TODO: hook subscriptions

    db.release();
    await pool.end();
})
