import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Batch } from '../../../api/batch.ts';

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
