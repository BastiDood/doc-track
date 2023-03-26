import { assert } from 'https://deno.land/std@0.160.0/testing/asserts.ts';
import { equals as bytewiseEquals } from 'bytes';
import { getSetCookies } from 'cookie';
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

import { env } from '~server/env.ts';
import { handleRequest } from '~server/routes/mod.ts';

Deno.test('full API integration test', async t => {
    const pool = new Pool({
        user: env.PG_USER,
        password: env.PG_PASSWORD,
        hostname: env.PG_HOSTNAME,
        port: env.PG_PORT,
        database: env.PG_DATABASE,
    }, 1, false);
    
    // Preconnect with the database (to mitigate resource leaks)
    const client = await pool.connect();
    client.release();

    // Mock the `fetch` function and its cookie store
    const origFetch = globalThis.fetch;
    const cookies = new Map<string, string>;
    globalThis.fetch = async (input, init) => {
        const res = await handleRequest(pool, new Request('https://doctrack.app' + input, init));
        for (const { name, value } of getSetCookies(res.headers))
            cookies.set(name, value);
        return res;
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

    // Restore the original fetch
    globalThis.fetch = origFetch;
    await pool.end();
});
