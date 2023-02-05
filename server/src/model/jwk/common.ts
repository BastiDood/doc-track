import { z } from 'zod';

// @see https://cloud.google.com/iot/docs/how-tos/credentials/jwts#jwt_header
export const Algorithm = z.enum([ 'RS256', 'ES256' ]);
export const KeyId = z.string().min(1);
