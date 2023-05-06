import { asyncReadable, derived } from '@square/svelte-store';

import { allOffices } from './OfficeStore.ts';
import { Session } from '../../../api/session.ts';
import { User as UserModel } from '~model/user.ts';
import { User } from '../../../api/user.ts';

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
} as UserModel);

export const userList = asyncReadable(
    [],
    User.getAll,
    { reloadable: true }
);

export const userOffices = derived([userSession, allOffices], ([$userSession, $allOffices]) => {
    function* iterator() {
        if ($userSession === null) return; // don't return anything!
        for (const id of Object.keys($userSession.local_perms)) {
            const office = $allOffices[parseInt(id, 10)];
            if (typeof office !== 'undefined') yield [id, office] as const;
        }
    }
    return Object.fromEntries(iterator());
});
