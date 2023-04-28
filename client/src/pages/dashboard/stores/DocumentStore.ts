import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Document } from '../../../api/document';

export const documentInbox = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        return currentOffice === null
            ? Promise.resolve({
                pending: [],
                accept: [],
            })
            : Document.getInbox(currentOffice);
    },
    { reloadable: true }
);

export const documentOutbox = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        return currentOffice === null
            ? Promise.resolve({
                pending: [],
                ready: [],
            })
            : Document.getOutbox(currentOffice);
    },
    { reloadable: true }
);
