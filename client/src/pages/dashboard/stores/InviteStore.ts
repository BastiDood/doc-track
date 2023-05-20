import { asyncDerived } from '@square/svelte-store';
import { assert } from '../../../assert.ts';
import { dashboardState } from './DashboardState.ts';
import { topToastMessage } from './ToastStore.ts';
import { Invite } from '../../../api/invite.ts';

export const inviteList = asyncDerived(
    dashboardState,
    ({ currentOffice }) => {
        try {
            if (currentOffice !== null)
                return Invite.getList(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve([]);
    },
    { reloadable: true }
);
