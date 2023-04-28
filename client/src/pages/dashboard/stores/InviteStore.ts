import { asyncDerived } from '@square/svelte-store';
import { dashboardState } from './DashboardState.ts';
import { Invite } from '../../../api/invite.ts';

export const inviteList = asyncDerived(
    dashboardState,
    ({ currentOffice }) => currentOffice === null ? Promise.resolve([]) : Invite.getList(currentOffice),
    { reloadable: true }
);
