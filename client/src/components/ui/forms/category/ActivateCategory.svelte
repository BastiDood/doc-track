<script lang="ts">
    import { Category as CategoryModel } from '~model/category.ts';
    import { Category } from '../../../../api/category.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { categoryList } from '../../../../pages/dashboard/stores/CategoryStore.ts';
    import { IconColor } from '../../../types.ts';
    
    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';
    import CategorySelect from '../../CategorySelect.svelte';

    let catId: CategoryModel['id'] | null = null;

    async function handleSubmit(this: HTMLFormElement) {
        if (catId === null) return;
        if (!this.reportValidity()) return;

        try {
            await Category.activate(catId);
            await categoryList.reload?.();
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently reactivating a category as {$userSession?.email}</p>

<article>
    {#await categoryList.load()}
        Loading list of retired categories...
    {:then}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>
            <CategorySelect bind:catId categories={$categoryList.retire} />
            <br />
            {#if typeof catId === 'number'}
                <Button submit><Edit color={IconColor.White} alt="Reactivate Category" /> Reactivate Category</Button>
            {/if}
        </form>
    {/await}
</article>
