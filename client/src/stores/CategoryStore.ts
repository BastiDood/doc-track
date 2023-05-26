import { asyncReadable } from '@square/svelte-store';
import { Category } from '../api/category.ts';

/**
 * Contains the list of all available categories in the system
 *
 * # Store Details
 * - The store has two properties, active and retired.
 * - Both properties contain an array of {@linkcode CategorySchemas}.
 * - By default, the initial value of this store is the two properties with empty array.
 */
export const categoryList = asyncReadable(
    { active: [], retire: [] },
    Category.getAll,
    { reloadable: true }
);
