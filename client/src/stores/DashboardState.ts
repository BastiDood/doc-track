import { writable } from '@square/svelte-store';
import { Office } from '~model/office';

export interface DashboardStateModel {
    currentOffice: Office['id'] | null;
    // TODO: We can add more states here, like darkmode setting possibly.
}

const { subscribe, update } = writable({
    currentOffice: null,
} as DashboardStateModel);

/**
 * The dashboardState store contains the {@linkcode currentOffice}, an integer number which represents the office the user is acting on behalf on.
 *
 * # Store Details
 * - Has a property `currentOffice` which designates current selected office.
 *
 * # Methods
 * - `.update(officeId: int)` => Changes the current office value to the passed integer value.
 */
export const dashboardState = {
    subscribe,
    /** You can use `$dashboardState.setOffice(number)` to set an office. */
    setOffice(officeId: Office['id'] | null) {
        update(state => {
            state.currentOffice = officeId;
            return state;
        });
    },
};
