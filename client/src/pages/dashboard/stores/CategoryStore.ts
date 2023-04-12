import { asyncReadable } from '@square/svelte-store';

import { Category } from '../../../api/category.ts'

export const officeList = asyncReadable(
    [],
    Category.getAllActive,
    { reloadable: true }
);

// Need some API to get all categories, even disabled ones for server operator.