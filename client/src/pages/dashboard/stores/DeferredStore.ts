import { asyncWritable } from '@square/svelte-store';
import localForage from 'localforage';
import { z } from 'zod';

import { type DeferredSnapshot, DeferredRegistrationSchema, DeferredSnapshotSchema } from '../../../../../model/src/api.ts';
import { Status } from '../../../../../model/src/snapshot.ts';

import { assert } from '../../../assert.ts';
import { DeferredFetchSchema } from '../../syncman.ts';

import { topToastMessage } from './ToastStore.ts';

const deferStore = asyncWritable(
    [],
    async() => {
        // Get all keys in the localStorage and resolve all of them and set as contents of this store.
        const keys = await localForage.keys();
        const deferred = keys.map(async key => {
            const defer = DeferredFetchSchema.parse(await localForage.getItem(key));
            const url = new URL(defer.url);
            if (url.pathname.startsWith('/api/document'))
                return { doc: DeferredRegistrationSchema.parse(JSON.parse(defer.body)).id, status: Status.Register };

            return DeferredSnapshotSchema.parse(JSON.parse(defer.body));
        });
        return Promise.all(deferred);
    },
);

export const deferredSnaps = {
    subscribe: deferStore.subscribe,
    reset: deferStore.reset?.bind(deferStore),
    load: deferStore.load.bind(deferStore),
    onDocumentSync(evt: MessageEvent) {
        assert(z.string().parse(evt.data) === 'sync');
        topToastMessage.enqueue({ title: 'Background Syncronization', body: 'Syncronization successful.' });
        deferStore.reset?.();
    },
    upsert(insert: DeferredSnapshot) {
        return deferStore.update.call(null, snaps => {
            const maybeIndex = snaps.findIndex(snap => snap.doc === insert.doc);
            if (maybeIndex >= 0) snaps.splice(maybeIndex, 1);
            return [...snaps, insert];
        });
    },
    countDeferRegistration() {
        let count = 0;
        const unsubscribe = deferStore.subscribe(snaps => (count = snaps.filter(snap => snap.status === Status.Register).length));
        unsubscribe();
        return count;
    },
};
