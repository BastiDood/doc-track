<script lang="ts">
    import { Office } from '../../../../model/src/office.ts'
    export let options: Office[] = [];
    export let value: string | undefined = undefined;
    export let index = 0;

    $: value = (options ? options.find((office => office.id == index))?.name : undefined);
</script>

<select bind:value={index}>
    {#each options as option}
        <option value={option.id}>{option.name}</option>
    {:else}
        <option value={0}> No available office to select. </option>
    {/each}
</select>

<style>
    @import url('../../pages/vars.css');

    select {
        padding: var(--spacing-small) var(--spacing-normal)  var(--spacing-small) var(--spacing-normal);
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
