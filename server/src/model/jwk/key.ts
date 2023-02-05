import { z } from 'zod';

import { Algorithm, KeyId } from './common.ts';

export const KeySchema = z.object({
    alg: Algorithm,
    use: z.literal('sig'),
    kid: KeyId,
});

export type Key = z.infer<typeof KeySchema>;
