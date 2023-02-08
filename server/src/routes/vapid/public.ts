import { env } from '../../env.ts';

export function handleVapidPublicKey() {
    return new Response(env.VAPID_PUB_KEY, {
        headers: { 'Content-Type': 'application/octet-stream' },
    });
}
