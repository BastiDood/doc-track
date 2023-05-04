import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Staff } from '../../../api/staff.ts';

export const staffList = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        return currentOffice === null
            ? Promise.resolve([])
            : Staff.get(currentOffice);
    },
    { reloadable: true }
);
