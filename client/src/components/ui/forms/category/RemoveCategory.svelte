<script lang="ts">
    import { Category as CategoryModel } from '~model/category.ts';
    import { Category } from '../../../../api/category.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { categoryList } from '../../../../pages/dashboard/stores/CategoryStore.ts';
    import { IconColor, ButtonType } from '../../../types.ts';
    
    import Button from '../../Button.svelte';
    import Close from '../../../icons/Close.svelte';
    import CategorySelect from '../../CategorySelect.svelte';

    let catId: CategoryModel['id'] | null = null;

    async function handleSubmit(this: HTMLFormElement) {
        if (catId === null) return;
        if (!this.reportValidity()) return;

        try {
            await Category.remove(catId);
            await categoryList.reload?.();
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently removing a category as {$userSession?.email}</p>

<article>
    {#await categoryList.load()}
        Loading list of removable categories...
    {:then { active: categories }}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>
            <CategorySelect bind:catId {categories} />
            <br />
            <Button type={ButtonType.Danger} submit><Close color={IconColor.White} alt="Edit Category" /> Remove Category</Button>
        </form>
    {/await}
</article>
