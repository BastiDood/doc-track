import { asyncReadable, derived } from '@square/svelte-store';
import { assert } from '../assert.ts';
import { allOffices } from './OfficeStore.ts';
import { Session } from '../api/session.ts';
import { User as UserModel } from '~model/user.ts';
import { User } from '../api/user.ts';
import { topToastMessage } from './ToastStore.ts';

export const userSession = asyncReadable(
    null,
    () => {
        try {
            return Session.getUser();
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve(null);
    },
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
    () => {
        try {
            return User.getAll();
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve([]);
    },
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
