<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Category } from '~model/category.ts';

    import { assert } from '../../../../assert.ts';
    import { Category as Api } from '../../../../api/category.ts';
    import { Events, IconColor, ToastType } from '../../../types.ts';

    import { categoryList } from '../../../../stores/CategoryStore.ts';
    import { topToastMessage } from '../../../../stores/ToastStore.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';

    export let cid: Category['id'];

    let currName: Category['name'] = '';

    const dispatch = createEventDispatcher();
    async function handleSubmit(this: HTMLFormElement) {
        if (!this.reportValidity()) return;
        try {
            await Api.rename({ id: cid, name: currName });
            await categoryList.reload?.();
            topToastMessage.enqueue({
                type: ToastType.Success,
                title: 'Category Rename',
                body: 'You successfully renamed a category.',
            });
            this.reset();
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        } finally {
            dispatch(Events.Done);
        }
    }
</script>

<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <TextInput
        required
        placeholder="Name"
        name="categoryname"
        label="Category Name:"
        bind:value={currName}
    />
    <Button submit><Edit color={IconColor.White} alt="Edit Category" /> Edit Category</Button>
</form>
