import { asyncDerived } from '@square/svelte-store';
import { assert } from '../assert.ts';
import { dashboardState } from './DashboardState.ts';
import { Document } from '../api/document.ts';
import { topToastMessage } from './ToastStore.ts';

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
