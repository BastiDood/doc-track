import { asyncReadable, derived } from '@square/svelte-store';

import { assert } from '../../../assert.ts';

import { allOffices } from './OfficeStore.ts';
import { AllOfficesSchema } from '../../../../../model/src/api.ts';
import { Session } from '../../../api/session.ts';
import { User } from '~model/user.ts';

export const userSession = asyncReadable(
    null,
    Session.getUser,
    { reloadable: true }
);

export const currentUser = derived(userSession, session => session === null ? null : {
    id: session.id,
    name: session.name,
    email: session.email,
    picture: session.picture,
    permission: session.global_perms,
} as User);

export const userOffices = derived([userSession, allOffices], ([$userSession, $allOffices]) => {
    if ($userSession === null) return {};
    if (Object.entries($userSession.local_perms).length === 0) return {};
    const filterOfficeArr = Object.entries($allOffices).filter(
        ([officeId, _]) => Object.keys($userSession.local_perms).includes(officeId)
    );
    return AllOfficesSchema.parse(Object.fromEntries(filterOfficeArr));
});
