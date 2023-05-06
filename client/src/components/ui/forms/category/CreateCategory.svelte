<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Category } from '~model/category.ts';

    import { Category as Api } from '../../../../api/category.ts';
    import { categoryList } from '../../../../pages/dashboard/stores/CategoryStore.ts';
    import { Events, IconColor } from '../../../types.ts';

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
            this.reset();
        } catch (err) {
            alert(err);
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
    <Button submit><Checkmark color={IconColor.White} alt="Create New Category"/> New Category</Button>
</form>
