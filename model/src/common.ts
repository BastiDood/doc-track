import { z } from 'zod';

export const Email = z.string().max(32).email();
export const Permission = z.string().transform(bits => parseInt(bits, 2));
