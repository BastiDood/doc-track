import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Document } from '../api/document.ts';

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
        return currentOffice === null
            ? Promise.resolve({
                pending: [],
                accept: [],
            })
            : Document.getInbox(currentOffice);
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
        return currentOffice === null
            ? Promise.resolve({
                pending: [],
                ready: [],
            })
            : Document.getOutbox(currentOffice);
    },
    { reloadable: true }
);
