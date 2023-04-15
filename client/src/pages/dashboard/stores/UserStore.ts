import { asyncReadable, derived } from '@square/svelte-store';

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
