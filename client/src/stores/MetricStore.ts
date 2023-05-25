import { asyncReadable, asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Metrics } from '../api/metrics.ts';
import { assert } from '../assert.ts';
import { topToastMessage } from './ToastStore.ts';

/**
 * The userSummary store contains metrics for the currently logged in user.
 * 
 * # Store Details
 * - Contains a record of the metric and the relevant value for the logged in user.
 * - Is an empty store otherwise.
 */
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

/**
 * The localSummary store contains metrics for the currently selected ofice.
 * 
 * # Store Details
 * - Contains a record of the metric and the relevant value for the currently selected office.
 * - Is an empty store otherwise.
 */
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

/**
 * The globalSummary store contains the entire system-wide metrics.
 * 
 * # Store Details
 * - Contains a record of the metrics that correspond to all snapshots in the system.
 * - Is an empty store otherwise.
 */
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

/**
 * The barcodeSummary store contains information regarding the barcodes used and pending or a selected office.
 * 
 * # Store Details
 * - Contains a numerical value for `assigned` and `pending` barcodes in the form of a {@linkcode BarcodeMetricsSchema}
 * - Is `null` otherwise.
 */
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
