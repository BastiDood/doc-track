import { asyncWritable } from '@square/svelte-store';
import { DeferredSnapshotSchema } from '../../../../../model/src/api.ts';
import localForage from 'localforage';
import { DeferredFetch } from '../../syncman.ts';
import { assert } from '../../../assert.ts';

export const deferredSnaps = asyncWritable(
    [],
    async() => {
        // Get all keys in the localStorage and resolve all of them and set as contents of this store.
        const deferred = (await localForage.keys()).map(async key => {
            console.log(key);
            const defer: DeferredFetch | null = await localForage.getItem(key);
            assert(defer !== null);
            return DeferredSnapshotSchema.parse(defer.body);
        });
        return Promise.all(deferred);
    },
);