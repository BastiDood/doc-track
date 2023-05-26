import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
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
    ({ currentOffice }) => currentOffice === null ? Promise.resolve([]) : Invite.getList(currentOffice),
    { reloadable: true }
);
