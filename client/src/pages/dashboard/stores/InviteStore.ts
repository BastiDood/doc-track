import { asyncDerived } from '@square/svelte-store';
import { assert } from '../../../assert.ts';
import { dashboardState } from './DashboardState.ts';
import { topToastMessage } from './ToastStore.ts';
import { Invite } from '../../../api/invite.ts';
import { NoActiveOffice } from '../../../api/error.ts';

export const inviteList = asyncDerived(
    dashboardState,
    async({ currentOffice }) => {
        try {
            if (currentOffice === null) throw new NoActiveOffice;
            return await Invite.getList(currentOffice);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
            return Promise.resolve([]);
        }
    },
    { reloadable: true }
);
