import { StatusCodes } from 'http-status-codes';

import { assert } from '../assert.ts';
import { BadContentNegotiation, InvalidInput, UnexpectedStatusCode } from './error.ts';

import type { Notification } from '../../../model/src/notification.ts';

export namespace Vapid {
    /** @returns VAPID public key of the server as raw bytes */
    export async function getVapidPublicKey(): Promise<ArrayBuffer> {
        const res = await fetch('/api/vapid', { headers: { 'Accept': 'application/octet-stream' } });
        if (res.status === Number(StatusCodes.OK)) return res.arrayBuffer();
        throw new UnexpectedStatusCode;
    }

    export async function hookSubscription({ sub, doc }: Notification) {
        const res = await fetch(`/api/hook?doc=${doc}`, {
            method: 'POST',
            body: sub,
            headers: { 'Content-Type': 'text/plain' },
        });
        switch (res.status) {
            case StatusCodes.CREATED: return;
            case StatusCodes.BAD_REQUEST: throw new InvalidInput;
            case StatusCodes.NOT_ACCEPTABLE: throw new BadContentNegotiation;
            default: throw new UnexpectedStatusCode;
        }
    }

    /** Registers a push subscription to the server (for later use). */
    export async function sendSubscription({ endpoint, expirationTime, keys }: PushSubscriptionJSON) {
        const auth = keys?.auth;
        assert(auth);

        const { p256dh } = keys;
        assert(p256dh);

        const res = await fetch('/api/vapid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint,
                expiration: expirationTime,
                auth,
                p256dh,
            }),
        });

        if (res.status === Number(StatusCodes.CREATED)) return;
        throw new UnexpectedStatusCode;
    }
}
