import { asyncReadable, asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Metrics } from '../../../api/metrics.ts';
import { assert } from '../../../assert.ts';
import { topToastMessage } from './ToastStore.ts';

export const userSummary = asyncReadable(
    { },
    () => {
        try {
            return Metrics.generateUserSummary();
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve({ });
    },
    { reloadable: true }
);

export const localSummary = asyncDerived(
    dashboardState,
    ({ currentOffice }) => {
        try {
            if (currentOffice !== null)
                return Metrics.generateLocalSummary(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve({ });
    },
    { reloadable: true }
);

export const globalSummary = asyncReadable(
    { },
    () => {
        try {
            return Metrics.generateGlobalSummary();
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve({ });
    },
    { reloadable: true }
);

export const barcodeSummary = asyncDerived(
    dashboardState,
    ({ currentOffice }) => {
        try {
            if (currentOffice !== null)
                return Metrics.generateBarcodeSummary(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve(null);
    },
    { reloadable: true }
);

export async function reloadMetrics() {
    await userSummary.reload?.();
    await localSummary.reload?.();
    await globalSummary.reload?.();
    await barcodeSummary.reload?.();
}
