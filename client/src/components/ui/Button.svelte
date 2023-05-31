<script lang="ts">
    import { ButtonType } from '../types.ts';
    export let type: ButtonType = ButtonType.Primary;
    export let submit = false as boolean;
    export let disabled = false as boolean;
</script>

<button type={submit ? 'submit' : 'button'} class={type} {disabled} on:click>
    <slot />
</button>

<style>
    @import url('../../pages/vars.css');

    button {
        margin: var(--spacing-normal);
        padding: var(--spacing-medium);
        border-radius: var(--border-radius);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: space-around;
        column-gap: var(--spacing-normal);
    }

    button:hover {
        filter: contrast(1.5);
    }

    .primary {
        color: white;
        border: 0;
    }

    .secondary {
        background-color: white;
        color: var(--text-color);
        border-style: solid;
        border-color: var(--primary-color);
    }

    .danger {
        background-color: var(--danger-color);
        color: white;
    }
</style>
