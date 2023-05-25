import { asyncDerived } from '@square/svelte-store';
import { assert } from '../assert.ts';
import { dashboardState } from './DashboardState.ts';
import { topToastMessage } from './ToastStore.ts';
import { Invite } from '../api/invite.ts';

/**
 * The invite list contains the list of invited emails for the selected current office.
 *
 * # Store Details
 * - Contains an array of invited emails in the form of a {@linkcode InvitationSchema}
 * - An empty array if there is no one to invite.
 */
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
