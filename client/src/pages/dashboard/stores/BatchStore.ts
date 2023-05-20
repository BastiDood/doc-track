import { asyncDerived } from '@square/svelte-store';
import { assert } from '../../../assert.ts';
import { topToastMessage } from './ToastStore.ts';
import { dashboardState } from './DashboardState.ts';
import { Batch } from '../../../api/batch.ts';

export const earliestBatch = asyncDerived(
    dashboardState,
    ({ currentOffice }) => {
        try {
            if (currentOffice !== null)
                return Batch.getEarliestBatch(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve(null);
    },
    { reloadable: true }
);
