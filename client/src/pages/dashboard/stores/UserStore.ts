import { asyncReadable } from '@square/svelte-store'
import { Session } from '../../../api/session.ts'

export const userSession = asyncReadable(
    null,
    Session.getUser, 
    { reloadable: true }
);