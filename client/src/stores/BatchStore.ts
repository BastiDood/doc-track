import { asyncDerived } from '@square/svelte-store';
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
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        return currentOffice === null
            ? Promise.resolve(null)
            : Batch.getEarliestBatch(currentOffice);
    },
    { reloadable: true }
);
