// HACK: IntelliSense doesn't seem to be playing nice unless we do this.
import type { Loadable } from '@square/svelte-store/lib/async-stores/types.js';
import { asyncReadable } from '@square/svelte-store/lib/async-stores';

import type { Office as OfficeModel } from './../../../../model/src/office.ts';

import { Office } from '../../../api/office.ts'

export const officeList: Loadable<OfficeModel[]> = asyncReadable (
    null,
    Office.getAll,
    { reloadable: true}
);