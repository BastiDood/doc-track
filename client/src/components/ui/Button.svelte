<script lang="ts">
    import { ButtonType } from '../types.ts';
    export let type: ButtonType = ButtonType.Primary;
    export let submit = false;
    export let disabled = false;
</script>

<button type={submit ? 'submit' : 'button'} class={type} {disabled} on:click>
    <slot>{type}</slot>
</button>

<style>
    @import url('../../pages/vars.css');

    button {
        margin: var(--spacing-normal);
        padding: var(--spacing-medium);
        border-radius: var(--border-radius);
        border: 0;
        cursor: pointer;
        color: white;
    }

    button:hover {
        filter: contrast(1.5);
    }
</style>
