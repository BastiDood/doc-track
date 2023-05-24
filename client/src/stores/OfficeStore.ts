import { asyncReadable } from '@square/svelte-store';

import { Office } from '../api/office.ts';

export const allOffices = asyncReadable(
    { },
    Office.getAll,
    { reloadable: true }
);
