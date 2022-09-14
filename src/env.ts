import { assert } from './deps.ts';

const PORT = Deno.env.get('PORT');
assert(PORT !== undefined);

export const env = { PORT: parseInt(PORT, 10) };
