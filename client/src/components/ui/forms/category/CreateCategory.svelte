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
    import Checkmark from '../../../icons/Checkmark.svelte';

    let name: Category['name'] = '';

    const dispatch = createEventDispatcher();
    async function handleSubmit(this: HTMLFormElement) {
        if (!name) return;
        try {
            await Api.create(name);
            await categoryList.reload?.();
            topToastMessage.enqueue({
                type: ToastType.Success,
                title: 'Category Creation',
                body: 'You successfully created a category.',
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
        placeholder="New Category"
        name="newcat"
        label="New Category Name:"
        bind:value={name}
    />
    <Button submit><Checkmark color={IconColor.White} alt="Create New Category" /> New Category</Button>
</form>
