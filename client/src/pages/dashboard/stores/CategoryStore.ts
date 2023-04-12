import { asyncReadable } from '@square/svelte-store';

import { Category } from '../../../api/category.ts';

export const officeList = asyncReadable(
    { active: [], retired: [] },
    Category.getAll,
    { reloadable: true }
);

