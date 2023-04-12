<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { Category } from '../../../../api/category.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { categoryList } from '../../../../pages/dashboard/stores/CategoryStore.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';

    async function handleSubmit(this: HTMLFormElement) {
        const node = this.elements.namedItem('newcat');
        assert(node instanceof HTMLInputElement);
        assert(node.type === 'text');

        if (!node.value) return;

        try {
            await Category.create(node.value);
            await categoryList.reload?.();
            this.reset();
        } catch (err) {
            alert(err);
        }
    }

</script>

<p>You are currently adding a category as {$userSession?.email}</p>

<section>
    {#each $categoryList as category (category.id)}
        <p>{category.id}: {category.name} [{category.active ? "ACTIVE" : "INACTIVE"}]</p>
    {:else}
        No categories available.
    {/each}
</section>
<article>
    <form on:submit|preventDefault|stopPropagation={handleSubmit}>
        <TextInput
            placeholder="New Category"
            name="newcat"
            label="New Category Name:"
        />
        <Button submit><Checkmark alt="Create New Category"/> New Category</Button>
    </form>
</article>

<style>
    @import url('../../../../pages/vars.css');
    section {
        overflow-y: scroll;
        border: var(--spacing-tiny) solid;
        height: 50vh;
    }
</style>