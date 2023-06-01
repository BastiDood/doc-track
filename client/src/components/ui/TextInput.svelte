<script lang="ts">
    export let placeholder = '';
    export let disabled = false;
    export let required = true;
    export let name: string;
    export let label: string;
    export let value: string | number = '';
</script>

{#if label}
    <label>
        {label}
        <input type="text" {placeholder} {name} {disabled} {required} bind:value />
    </label>
{:else}
    <input type="text" {placeholder} {name} {disabled} {required} bind:value />
{/if}

<style>
    @import url('../../pages/vars.css');

    input {
        border: var(--primary-color) 2px solid;
        border-radius: var(--border-radius);
        padding: var(--spacing-small) var(--spacing-normal);
    }
</style>
