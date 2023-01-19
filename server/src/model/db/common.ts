import { z } from 'zod';

export const Email = z.string().max(40).email();
