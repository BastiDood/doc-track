import { asyncDerived } from '@square/svelte-store';
import { assert } from '../../../assert.ts';
import { dashboardState } from './DashboardState.ts';
import { Document } from '../../../api/document';
import { topToastMessage } from './ToastStore.ts';
import { NoActiveOffice } from '../../../api/error.ts';

export const documentInbox = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        try {
            if (currentOffice === null) throw new NoActiveOffice;
            return Document.getInbox(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
            return Promise.resolve({ pending: [], accept: [] });
        }
    },
    { reloadable: true }
);

export const documentOutbox = asyncDerived(
    dashboardState,
    $dashboardState => {
        const { currentOffice } = $dashboardState;
        try {
            if (currentOffice === null) throw new NoActiveOffice;
            return Document.getOutbox(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
            return Promise.resolve({ pending: [], ready: [] });
        }
    },
    { reloadable: true }
);
