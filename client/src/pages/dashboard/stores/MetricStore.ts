import { asyncReadable, asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Metrics } from '../../../api/metrics.ts';

export const userSummary = asyncReadable(
    { },
    Metrics.generateUserSummary,
    { reloadable: true }
);

export const localSummary = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        return currentOffice === null
            ? Promise.resolve({ })
            : Metrics.generateLocalSummary(currentOffice);
    },
    { reloadable: true }
);

export const globalSummary = asyncReadable(
    { },
    Metrics.generateGlobalSummary,
    { reloadable: true }
);

export const barcodeSummary = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        return currentOffice === null
            ? Promise.resolve(null)
            : Metrics.generateBarcodeSummary(currentOffice);
    },
    { reloadable: true }
);

export async function reloadMetrics() {
    await userSummary.reload?.();
    await localSummary.reload?.();
    await globalSummary.reload?.();
    await barcodeSummary.reload?.();
}
