import { asyncWritable, derived } from '@square/svelte-store';
import localForage from 'localforage';

import { type DeferredSnapshot, DeferredRegistrationSchema, DeferredSnapshotSchema } from '../../../model/src/api.ts';
import { Status } from '../../../model/src/snapshot.ts';

import { assert } from '../assert.ts';
import { DeferredFetchSchema } from '../pages/syncman.ts';

import { topToastMessage } from './ToastStore.ts';
import { ToastType } from '../../../components/types.ts';

const deferStore = asyncWritable(
    [],
    async() => {
        // Get all keys in the localStorage and resolve all of them and set as contents of this store.
        const keys = await localForage.keys();
        const deferred = keys.map(async key => {
            const defer = DeferredFetchSchema.parse(await localForage.getItem(key));
            const { pathname } = new URL(defer.url);
            return pathname.startsWith('/api/document')
                ? { doc: DeferredRegistrationSchema.parse(JSON.parse(defer.body)).id, status: Status.Register }
                : DeferredSnapshotSchema.parse(JSON.parse(defer.body));
        });
        return Promise.all(deferred);
    },
);

export const deferredSnaps = {
    subscribe: deferStore.subscribe,
    reset: deferStore.reset?.bind(deferStore),
    load: deferStore.load.bind(deferStore),
    onDocumentSync(evt: MessageEvent<string>) {
        assert(evt.data === 'sync');
        topToastMessage.enqueue({
            type: ToastType.Offline,
            title: 'Background Syncronization',
            body: 'Syncronization successful.',
        });
        deferStore.reset?.();
    },
    upsert(insert: DeferredSnapshot) {
        return deferStore.update.call(null, snaps => {
            const maybeIndex = snaps.findIndex(snap => snap.doc === insert.doc);
            if (maybeIndex >= 0) snaps.splice(maybeIndex, 1);
            return [...snaps, insert];
        });
    },
};

export const deferRegistrationCount = derived(deferredSnaps, $deferredSnaps => $deferredSnaps.reduce((total, { status }) => total + Number(status === Status.Register), 0));
