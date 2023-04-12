<script lang="ts">
    import { Category as CategoryModel } from '~model/category.ts';
    import { Category } from '../../../../api/category.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { categoryActiveList, categoryList } from '../../../../pages/dashboard/stores/CategoryStore.ts';
    
    import Button from '../../Button.svelte';
    import Close from '../../../icons/Close.svelte';
    import CategorySelect from '../../CategorySelect.svelte';

    let currId: CategoryModel['id'] | null = null;
    let currName: CategoryModel['name'] | null = null;

    // eslint-disable-next-line no-extra-parens
    $: currName = $categoryActiveList.find(cat=> cat.id === currId)?.name ?? null;
    
    async function handleSubmit(this: HTMLFormElement) {
        if (currId === null || typeof currName !== 'string') return;

        try {
            await Category.remove(currId);
            await categoryActiveList.reload?.();
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

<p>You are currently renaming a category as {$userSession?.email}</p>

<article>
    {#if $categoryActiveList.length === 0}
        No categories to edit.
    {:else}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>
            <CategorySelect bind:catid={currId} categories={$categoryActiveList}/>
            <br/>
            {#if typeof currId === 'number'}
                <p>Category ID: {currId}</p>
                <p>Catergory Name: {currName}</p>
                {#if currName !== null}
                    <Button submit><Close alt="Edit Category"/> Remove Category</Button>
                {/if}
            {/if}
        </form>
    {/if}
</article>
