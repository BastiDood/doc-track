import { z } from 'zod';

import { StatusSchema } from './snapshot.ts';

export const UserMetricsSchema = z.record(StatusSchema, z.number().int().positive());
export type UserMetrics = z.infer<typeof UserMetricsSchema>;

