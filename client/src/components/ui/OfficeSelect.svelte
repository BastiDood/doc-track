<script lang="ts">
    import type { Office } from '../../../../model/src/office.ts';
    export let offices: Office[];
    export let oid: number | null = null;
</script>

<select bind:value={oid}>
    {#each offices as office (office.id)}
        <option value={office.id}>{office.name}</option>
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
