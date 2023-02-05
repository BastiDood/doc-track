import { z } from 'zod';

import { Algorithm, KeyId } from './common.ts';

export const HeaderSchema = z.object({
    alg: Algorithm,
    typ: z.literal('JWT'),
    kid: KeyId,
});

export type Header = z.infer<typeof HeaderSchema>;
