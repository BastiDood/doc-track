import { asyncDerived } from '@square/svelte-store';
import { assert } from '../../../assert.ts';
import { topToastMessage } from './ToastStore.ts';
import { dashboardState } from './DashboardState.ts';
import { Batch } from '../../../api/batch.ts';
import { NoActiveOffice } from '../../../api/error.ts';

export const earliestBatch = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        try {
            if (currentOffice === null) throw new NoActiveOffice;
            return Batch.getEarliestBatch(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
            return Promise.resolve(null);
        }
    },
    { reloadable: true }
);
