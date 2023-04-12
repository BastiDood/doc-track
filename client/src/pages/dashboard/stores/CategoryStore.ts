import { asyncReadable } from '@square/svelte-store';

import { Category } from '../../../api/category.ts';

export const categoryList = asyncReadable(
    { active: [], retire: [] },
    Category.getAll,
    { reloadable: true }
);

