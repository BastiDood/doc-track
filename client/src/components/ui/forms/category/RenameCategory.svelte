<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Category } from '~model/category.ts';
    import { Category as Api } from '../../../../api/category.ts';
    import { categoryList } from '../../../../pages/dashboard/stores/CategoryStore.ts';
    import { Events, IconColor } from '../../../types.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';

    export let cid: Category['id'];

    let currName: Category['name'] | undefined;

    const dispatch = createEventDispatcher();
    async function handleSubmit(this: HTMLFormElement) {
        if (typeof currName === 'undefined') return;
        if (!this.reportValidity()) return;

        try {
            await Api.rename({ id: cid, name: currName });
            await categoryList.reload?.();
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
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
