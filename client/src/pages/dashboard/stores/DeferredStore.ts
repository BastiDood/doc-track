import { asyncWritable } from '@square/svelte-store';
import { DeferredRegistrationSchema, DeferredSnapshotSchema } from '../../../../../model/src/api.ts';
import localForage from 'localforage';
import { DeferredFetch } from '../../syncman.ts';
import { assert } from '../../../assert.ts';
import { Status } from '../../../../../model/src/snapshot.ts';

export const deferredSnaps = asyncWritable(
    [],
    async() => {
        // Get all keys in the localStorage and resolve all of them and set as contents of this store.
        const deferred = (await localForage.keys()).map(async key => {
            const defer: DeferredFetch | null = await localForage.getItem(key);
            assert(defer !== null);
            const url = new URL(defer.url);
            if (url.pathname.startsWith('/api/document'))
                return { doc: DeferredRegistrationSchema.parse(defer.body).id, status: Status.Register };

            return DeferredSnapshotSchema.parse(defer.body);
        });
        return Promise.all(deferred);
    },
);