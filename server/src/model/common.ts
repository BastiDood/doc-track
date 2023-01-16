import { z } from '../deps.ts';

export const Email = z.string().max(40).email();
