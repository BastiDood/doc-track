import { asyncWritable, readable } from '@square/svelte-store';
import { DeferredRegistrationSchema, DeferredSnapshotSchema } from '../../../../../model/src/api.ts';
import localForage from 'localforage';
import { DeferredFetch, DeferredFetchSchema } from '../../syncman.ts';
import { assert } from '../../../assert.ts';
import { Status } from '../../../../../model/src/snapshot.ts';
import { z } from 'zod';
import { topToastMessage } from './ToastStore.ts';

export const latestMessage = readable(null as string | null, set=>{
    function handle(evt: MessageEvent) {
        set(z.string().parse(evt.data));
        topToastMessage.enqueue({ title: 'Background Syncronization', body: 'Syncronization successful.' });
    }
    addEventListener('message', handle);
    return () => removeEventListener('message', handle);
});

export const deferredSnaps = asyncWritable(
    [],
    async() => {
        // Get all keys in the localStorage and resolve all of them and set as contents of this store.
        const keys = await localForage.keys();
        const deferred = keys.map(async key => {
            const defer = DeferredFetchSchema.parse(await localForage.getItem(key));
            assert(defer !== null);
            const url = new URL(defer.url);
            if (url.pathname.startsWith('/api/document'))
                return { doc: DeferredRegistrationSchema.parse(defer.body).id, status: Status.Register };

            return DeferredSnapshotSchema.parse(defer.body);
        });
        return Promise.all(deferred);
    },
);
