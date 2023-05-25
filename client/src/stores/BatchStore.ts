import { asyncDerived } from '@square/svelte-store';
import { assert } from '../assert.ts';
import { topToastMessage } from './ToastStore.ts';
import { dashboardState } from './DashboardState.ts';
import { Batch } from '../api/batch.ts';

/**
 * Retrieves the earliest batch of barcodes given a {@linkcode currentOffice}.
 *
 * # Store Details
 * - Contains an array of {@linkcode MinBatchSchema} that contains the barcodes of the batch with unregistered barcodes.
 * - Defaults to null
 */
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
