import { asyncReadable } from '@square/svelte-store'
import { Session } from '../../api/session.ts'

export const userSession = asyncReadable(undefined, async() => {
    const userData = await Session.getUser()
    return userData;
    }, 
    { reloadable: true }
);