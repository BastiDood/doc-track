import { writable } from '@square/svelte-store';
import { Office } from '~model/office';

export interface dashboardStateModel {
    currentOffice: Office['id'] | null;
    // TODO: We can add more states here, like darkmode setting possibly.
}

export const dashboardState = writable({
    currentOffice: null,
} as dashboardStateModel);

export const dashboardSetter = {
    subscribe: dashboardState.subscribe,
    // You can use $dashboardState.setOffice(number) to set an office.
    setOffice: (officeId: Office['id']) => {
        dashboardState.set({
            ...dashboardState,
            currentOffice: officeId,
        });
    },
};