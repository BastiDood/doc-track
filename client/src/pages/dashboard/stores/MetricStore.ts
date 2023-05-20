import { asyncReadable, asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Metrics } from '../../../api/metrics.ts';
import { assert } from '../../../assert.ts';
import { topToastMessage } from './ToastStore.ts';
import { NoActiveOffice } from '../../../api/error.ts';

export const userSummary = asyncReadable(
    { },
    async() => {
        try {
            return await Metrics.generateUserSummary();
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
            return Promise.resolve({ });
        }
    },
    { reloadable: true }
);

export const localSummary = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        try {
            if (currentOffice === null) throw new NoActiveOffice;
            return Metrics.generateLocalSummary(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
            return Promise.resolve({ });
        }
    },
    { reloadable: true }
);

export const globalSummary = asyncReadable(
    { },
    async() => {
        try {
            return await Metrics.generateGlobalSummary();
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
            return Promise.resolve({ });
        }
    },
    { reloadable: true }
);

export const barcodeSummary = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        try {
            if (currentOffice === null) throw new NoActiveOffice;
            return Metrics.generateBarcodeSummary(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
            return Promise.resolve(null);
        }
    },
    { reloadable: true }
);

export async function reloadMetrics() {
    await userSummary.reload?.();
    await localSummary.reload?.();
    await globalSummary.reload?.();
    await barcodeSummary.reload?.();
}
