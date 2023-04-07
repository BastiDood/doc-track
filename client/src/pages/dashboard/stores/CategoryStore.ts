// HACK: IntelliSense doesn't seem to be playing nice unless we do this.
import type { Loadable } from '@square/svelte-store/lib/async-stores/types.js';
import { asyncReadable } from '@square/svelte-store/lib/async-stores';

import type { Category as CategoryModel } from './../../../../model/src/category.ts';

import { Category } from '../../../api/category.ts'

export const activeCategoryList: Loadable<CategoryModel[]> = asyncReadable (
    [],
    Category.getAllActive,
    { reloadable: true}
);

// Need some API to get all categories, even disabled ones for server operator.