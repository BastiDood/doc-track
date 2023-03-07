import { z } from 'zod';

export const Email = z.string().max(32).email();
export const Permission = z.number().int().nonnegative();
