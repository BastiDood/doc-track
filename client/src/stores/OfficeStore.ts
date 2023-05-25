import { asyncReadable } from '@square/svelte-store';

import { Office } from '../api/office.ts';

/**
 * This store contains a list of all of the registered offices in the system.
 *
 * # Store Details
 * - Contains a record of OfficeId and Office name pairs.
 * - Is an empty store otherwise.
 */
export const allOffices = asyncReadable(
    { },
    Office.getAll,
    { reloadable: true }
);
