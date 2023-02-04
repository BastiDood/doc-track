import { assert, assertArrayIncludes, assertEquals } from 'asserts';
import { Pool } from 'postgres';
import { validate } from 'uuid';

import { Database } from './database.ts';
import { env } from './env.ts';


Deno.test('full database tests', async t => {
    const pool = new Pool({
        user: env.PG_USER,
        password: env.PG_PASSWORD,
        hostname: env.PG_HOSTNAME,
        port: env.PG_PORT,
        database: env.PG_DATABASE,
    }, env.PG_POOL, true);
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

        await db.upgradeSession({
            id,
            user_id: USER.id,
            expiration,
            access_token: 'access-token',
        });

        assert(await db.checkValidSession(id));
    });

    db.release();
    await pool.end();
});
