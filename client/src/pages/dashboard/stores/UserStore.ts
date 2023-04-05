// HACK: IntelliSense doesn't seem to be playing nice unless we do this.
import type { Loadable } from '@square/svelte-store/lib/async-stores/types.js';
import { asyncReadable } from '@square/svelte-store/lib/async-stores';

import type { User } from '../../../../../model/src/user.ts';

import { Session } from '../../../api/session.ts';

export const userSession: Loadable<User> = asyncReadable(
    null,
    Session.getUser, 
    { reloadable: true }
);
