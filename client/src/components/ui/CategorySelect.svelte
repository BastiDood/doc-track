<script lang="ts">
    import type { Category } from '../../../../model/src/category.ts';
    export let categories: Pick<Category, 'id' | 'name'>[];
    export let catId: number | null = null;
</script>

<select required bind:value={catId}>
    {#each categories as category (category.id)}
        <option value={category.id}>{category.name}</option>
    {/each}
</select>

<style>
    @import url('../../pages/vars.css');

    select {
        padding: var(--spacing-small) var(--spacing-normal);
        border: var(--spacing-tiny) solid var(--shadow-color);
        border-radius: var(--border-radius);
        background: var(--dashboard-bg);
        box-shadow: 0 var(--spacing-tiny) var(--spacing-small) -0.0625em var(--shadow-color);
        cursor: pointer;
        transition: all var(--animation-length) ease;
    }

    select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 var(--spacing-tiny) rgba(var(--primary-color), 0.2);
    }
</style>
