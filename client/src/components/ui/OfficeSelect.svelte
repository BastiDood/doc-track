<script lang="ts">
    import type { AllOffices } from '../../../../model/src/api.ts';
    export let offices: AllOffices;
    export let oid: number | null = null;
</script>

<select required bind:value={oid}>
    {#each Object.entries(offices) as [id, office] (id)}
        <option value={id}>{office}</option>
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
        font-size: var(--normal);
        transition: all var(--animation-length) ease;
    }

    select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 var(--spacing-tiny) rgba(var(--primary-color), 0.2);
    }
</style>
