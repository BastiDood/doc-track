import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState';
import { Batch } from '../../../api/batch';

export const earliestBatch = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        return currentOffice === null
            ? Promise.resolve({})
            : Batch.getEarliestBatch(currentOffice);
    },
    { reloadable: true }
);
