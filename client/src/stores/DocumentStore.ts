import { asyncDerived } from '@square/svelte-store';
import { assert } from '../assert.ts';
import { dashboardState } from './DashboardState.ts';
import { Document } from '../api/document.ts';
import { topToastMessage } from './ToastStore.ts';

/**
 * - This store contains the documents that are in the Inbox for the selected office.
 *
 * # Store Details
 * - contains two properties, `pending` and `accept` which both contain arrays of {@linkcode AllInboxSchema}.
 * - `pending`: documents that are yet to be accepted by the selected office
 * - `accept`: documents accepted by the selected office
 */
export const documentInbox = asyncDerived(
    dashboardState,
    ({ currentOffice }) => {
        try {
            if (currentOffice !== null)
                return Document.getInbox(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve({ pending: [], accept: [] });
    },
    { reloadable: true }
);

/**
 * - This store contains the documents that are in the Outbox for the selected office.
 *
 * # Store Detail
 * - contains two properties, `pending` and `accept` which both contain arrays of {@linkcode AllOutboxSchema}.
 * - `pending`: documents that were created via Document Registration
 * - `ready`: documents that were sent to another office and yet to be received by them
 */
export const documentOutbox = asyncDerived(
    dashboardState,
    ({ currentOffice }) => {
        try {
            if (currentOffice !== null)
                return Document.getOutbox(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve({ pending: [], ready: [] });
    },
    { reloadable: true }
);
