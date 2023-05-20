import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Staff } from '../../../api/staff.ts';
import { NoActiveOffice } from '../../../api/error.ts';
import { assert } from '../../../assert.ts';
import { topToastMessage } from './ToastStore.ts';

export const staffList = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        try {
            if ( currentOffice === null ) throw new NoActiveOffice;
            return Staff.get(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
            return Promise.resolve([]);
        }
    },
    { reloadable: true }
);
