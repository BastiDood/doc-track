import { asyncReadable } from '@square/svelte-store';
import { assert } from '../../../assert.ts';
import { Category } from '../../../api/category.ts';
import { topToastMessage } from './ToastStore.ts';

export const categoryList = asyncReadable(
    { active: [], retire: [] },
    async() => {
        try {
            return await Category.getAll();
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
            return Promise.resolve({ active: [], retire: [] });
        }
    },
    { reloadable: true }
);
