import { assert } from './deps.ts';

const PORT = Deno.env.get('PORT');
assert(PORT !== undefined);

const VAPID_PRV_KEY = Deno.env.get('VAPID_PRV_KEY');
assert(VAPID_PRV_KEY !== undefined);

export const env = {
    PORT: parseInt(PORT, 10),
    VAPID_PRV_KEY,
};
