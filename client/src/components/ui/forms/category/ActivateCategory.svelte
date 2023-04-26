<script lang="ts">
    import { Category as CategoryModel } from '~model/category.ts';
    import { Category } from '../../../../api/category.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { categoryList } from '../../../../pages/dashboard/stores/CategoryStore.ts';
    import { IconColor } from '../../../types.ts';
    
    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';
    import CategorySelect from '../../CategorySelect.svelte';

    let currId: CategoryModel['id'] | null = null;
    let currName: CategoryModel['name'] | null = null;

    $: currName = $categoryList.retire.find(cat => cat.id === currId)?.name ?? null;
    
    async function handleSubmit(this: HTMLFormElement) {
        if (currId === null) return;
        if (!this.reportValidity()) return;

        try {
            await Category.activate(currId);

            await categoryList.reload?.();

            // eslint-disable-next-line require-atomic-updates
            currId = null;
            // eslint-disable-next-line require-atomic-updates
            currName = null;

            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently reactivating a category as {$userSession?.email}</p>

<article>
    {#if $categoryList.retire.length === 0}
        No categories to edit.
    {:else}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>
            <CategorySelect bind:catId={currId} categories={$categoryList.retire}/>
            <br/>
            {#if typeof currId === 'number'}
                <p>Category ID: {currId}</p>
                <p>Category Name: {currName}</p>
                {#if currName !== null}
                    <Button submit><Edit color={IconColor.White} alt="Reactivate Category"/> Reactivate Category</Button>
                {/if}
            {/if}
        </form>
    {/if}
</article>
