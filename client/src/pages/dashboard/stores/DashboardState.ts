import { writable } from '@square/svelte-store';
import { Office } from '~model/office';

export interface DashboardStateModel {
    currentOffice: Office['id'] | null;
    // TODO: We can add more states here, like darkmode setting possibly.
}

const { subscribe, update } = writable({
    currentOffice: null,
} as DashboardStateModel);

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
