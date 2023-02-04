import { z } from 'zod';

export const Email = z.string().max(40).email();
export const Permission = z.string().transform(bits => parseInt(bits, 2));