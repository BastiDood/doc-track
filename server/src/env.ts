import { assert } from 'asserts';
import { valid as isEmail } from 'email';
import { ApplicationServerKeys } from 'webpush';

const PORT = Deno.env.get('PORT');
assert(PORT);

const GOOGLE_ID = Deno.env.get('GOOGLE_ID');
assert(GOOGLE_ID);

const GOOGLE_SECRET = Deno.env.get('GOOGLE_SECRET');
assert(GOOGLE_SECRET);

const OAUTH_REDIRECT = Deno.env.get('OAUTH_REDIRECT');
assert(OAUTH_REDIRECT);

const HOSTED_GSUITE_DOMAIN = Deno.env.get('HOSTED_GSUITE_DOMAIN');
assert(HOSTED_GSUITE_DOMAIN);

const PG_HOSTNAME = Deno.env.get('PG_HOSTNAME') || '127.0.0.1';

const PG_DATABASE = Deno.env.get('PG_DATABASE') || 'doctrack';

const PG_PASSWORD = Deno.env.get('PG_PASSWORD');

const PG_PORT = Deno.env.get('PG_PORT');

const PG_USER = Deno.env.get('PG_USER') || 'postgres';

const PG_POOL = Deno.env.get('PG_POOL');

const VAPID_PUB_KEY = Deno.env.get('VAPID_PUB_KEY');
assert(VAPID_PUB_KEY);

const VAPID_PRV_KEY = Deno.env.get('VAPID_PRV_KEY');
assert(VAPID_PRV_KEY);

const VAPID_CREDENTIALS = await ApplicationServerKeys.fromJSON({
    publicKey: VAPID_PUB_KEY,
    privateKey: VAPID_PRV_KEY,
});

const VAPID_RAW_PUB_KEY = await crypto.subtle.exportKey('raw', VAPID_CREDENTIALS.publicKey);

const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL');
assert(VAPID_EMAIL);
assert(isEmail(VAPID_EMAIL));

export const env = {
    PORT: parseInt(PORT, 10),
    GOOGLE_ID,
    GOOGLE_SECRET,
    OAUTH_REDIRECT,
    HOSTED_GSUITE_DOMAIN,
    PG_HOSTNAME,
    PG_DATABASE,
    PG_PASSWORD,
    PG_PORT: PG_PORT ? parseInt(PG_PORT, 10) : 5432,
    PG_USER,
    PG_POOL: PG_POOL ? parseInt(PG_POOL, 10) : 4,
    VAPID_RAW_PUB_KEY,
    VAPID_CREDENTIALS,
    VAPID_EMAIL: 'mailto:' + VAPID_EMAIL,
};
