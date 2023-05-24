import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Staff } from '../api/staff.ts';
import { assert } from '../assert.ts';
import { topToastMessage } from './ToastStore.ts';

export const staffList = asyncDerived(
    dashboardState,
    ({ currentOffice }) => {
        try {
            if (currentOffice !== null)
                return Staff.get(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve([]);
    },
    { reloadable: true }
);
