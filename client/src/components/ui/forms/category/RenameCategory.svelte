<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { Category as CategoryModel } from '~model/category.ts';
    import { Category } from '../../../../api/category.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { categoryList } from '../../../../pages/dashboard/stores/CategoryStore.ts';
    import { IconColor } from '../../../types.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';
    import CategorySelect from '../../CategorySelect.svelte';

    let currId: CategoryModel['id'] | null = null;
    let currName: CategoryModel['name'] | null = null;

    $: currName = $categoryList.active.find(cat => cat.id === currId)?.name ?? null;

    async function handleSubmit(this: HTMLFormElement) {
        const input = this.elements.namedItem('categoryname');
        assert(input instanceof HTMLInputElement);
        assert(input.type === 'text');

        if (currId === null || typeof currName !== 'string') return;
        if (!this.reportValidity()) return;
        if (input.value === currName) return;

        try {
            await Category.rename({
                id: currId,
                name: input.value,
            });

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
    {#if $categoryList.active.length === 0}
        No categories to edit.
    {:else}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>
            <CategorySelect bind:catId={currId} categories={$categoryList.active}/>
            <br/>
            {#if typeof currId === 'number'}
                <p>Category ID: {currId}</p>
                {#if currName !== null}
                    <TextInput
                        required
                        placeholder={currName}
                        name="categoryname"
                        label="Category Name:"
                    />
                    <Button submit><Edit color={IconColor.White} alt="Edit Category"/> Edit Category</Button>
                {/if}
            {/if}
        </form>
    {/if}
</article>
