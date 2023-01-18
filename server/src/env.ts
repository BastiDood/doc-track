import { assert } from 'asserts';

const PORT = Deno.env.get('PORT');
assert(PORT);

const GOOGLE_ID = Deno.env.get('GOOGLE_ID');
assert(GOOGLE_ID);

const OAUTH_REDIRECT = Deno.env.get('OAUTH_REDIRECT');
assert(OAUTH_REDIRECT);

const HOSTED_GSUITE_DOMAIN = Deno.env.get('HOSTED_GSUITE_DOMAIN');
assert(HOSTED_GSUITE_DOMAIN);

const VAPID_PRV_KEY = Deno.env.get('VAPID_PRV_KEY');
assert(VAPID_PRV_KEY);

export const env = {
    PORT: parseInt(PORT, 10),
    GOOGLE_ID,
    OAUTH_REDIRECT,
    HOSTED_GSUITE_DOMAIN,
    VAPID_PRV_KEY,
};
