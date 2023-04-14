import { z } from 'zod';

import { StatusSchema } from './snapshot.ts';

export const MetricsSchema = z.record(StatusSchema, z.number().int().positive());
export type Metrics = z.infer<typeof MetricsSchema>;

