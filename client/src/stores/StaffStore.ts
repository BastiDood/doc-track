import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Staff } from '../api/staff.ts';

/**
 * This store contains the staff members of the currently selected office.
 *
 * # Store Details
 * - The store returns an array of staff members in the form of {@linkcode StaffMember}.
 * - An empty array otherwise.
 */
export const staffList = asyncDerived(
    dashboardState,
    ({ currentOffice }) => {
        return currentOffice === null
            ? Promise.resolve([])
            : Staff.get(currentOffice);
    },
    { reloadable: true }
);
