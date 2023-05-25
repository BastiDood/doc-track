import { asyncReadable, derived } from '@square/svelte-store';
import { assert } from '../assert.ts';
import { allOffices } from './OfficeStore.ts';
import { Session } from '../api/session.ts';
import { User as UserModel } from '~model/user.ts';
import { User } from '../api/user.ts';
import { topToastMessage } from './ToastStore.ts';

/**
 * This store contains all the information re: the current user logged in.
 * NOTE: Please use {@linkcode currentUser} to get derived information of the user instead.
 * 
 * # Store Details
 * - Contains all the details pertaining to the currently logged in user in the form of an {@linkcode FullSession}.
 * - Is `null` otherwise.
 */
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

/**
 * This store contains the {@linkcode UserModel} of the currently logged in user.
 * 
 * # Store Details
 * - Contains all the details pertaining to the currently logged in user in the form of a {@linkcode UserModel}.
 * - Is `null` otherwise.
 */
export const currentUser = derived(userSession, session => session === null ? null : {
    id: session.id,
    name: session.name,
    email: session.email,
    picture: session.picture,
    permission: session.global_perms,
} as UserModel);

/**
 * This store contains all of the users in the DocTrack system as an array of {@linkcode UserType}.
 * 
 * # Store Details
 * - Contains all the users in the system as an array of {@linkcode UserType}.
 * - An empty array otherwise.
 */
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

/**
 * This store contains all off the offices the {@linkcode currentUser} is a member of in the form of a OfficeID, OfficeName record.
 * 
 * # Store Details
 * - Contains all the office that the {@linkcode currentUser} is part of in an OfficeID, Name record pair.
 * - Contains an empty array otherwise.
 */
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
