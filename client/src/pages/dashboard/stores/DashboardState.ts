import { writable } from '@square/svelte-store';
import { Office } from '~model/office';

export interface DashboardStateModel {
    currentOffice: Office['id'] | null;
    // TODO: We can add more states here, like darkmode setting possibly.
}

const dashboardModel = writable({
    currentOffice: null,
} as DashboardStateModel);

export const dashboardState = {
    subscribe: dashboardModel.subscribe,
    // You can use $dashboardState.setOffice(number) to set an office.
    setOffice: (officeId: Office['id']) => {
        dashboardModel.set({
            ...dashboardModel,
            currentOffice: officeId,
        });
    },
};
