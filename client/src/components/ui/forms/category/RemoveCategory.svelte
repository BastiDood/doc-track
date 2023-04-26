<script lang="ts">
    import { Category as CategoryModel } from '~model/category.ts';
    import { Category } from '../../../../api/category.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { categoryList } from '../../../../pages/dashboard/stores/CategoryStore.ts';
    import { IconColor, ButtonType } from '../../../types.ts';
    
    import Button from '../../Button.svelte';
    import Close from '../../../icons/Close.svelte';
    import CategorySelect from '../../CategorySelect.svelte';

    let currId: CategoryModel['id'] | null = null;
    let currName: CategoryModel['name'] | null = null;

    $: currName = $categoryList.active.find(cat => cat.id === currId)?.name ?? null;

    async function handleSubmit(this: HTMLFormElement) {
        if (currId === null || typeof currName !== 'string') return;

        try {
            await Category.remove(currId);
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

<p>You are currently removing a category as {$userSession?.email}</p>

<article>
    {#if $categoryList.active.length === 0}
        No categories to edit.
    {:else}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>
            <CategorySelect bind:catId={currId} categories={$categoryList.active}/>
            <br/>
            {#if typeof currId === 'number'}
                <p>Category ID: {currId}</p>
                <p>Catergory Name: {currName}</p>
                {#if currName !== null}
                    <Button type={ButtonType.Danger} submit><Close color={IconColor.White} alt="Edit Category"/> Remove Category</Button>
                {/if}
            {/if}
        </form>
    {/if}
</article>
