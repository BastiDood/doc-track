import { asyncReadable } from '@square/svelte-store';
import { assert } from '../assert.ts';
import { Category } from '../api/category.ts';
import { topToastMessage } from './ToastStore.ts';

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
    () => {
        try {
            return Category.getAll();
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
        return Promise.resolve({ active: [], retire: [] });
    },
    { reloadable: true }
);
