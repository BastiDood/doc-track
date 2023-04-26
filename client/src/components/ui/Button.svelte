<script lang="ts">
    import { ButtonType } from '../types.ts';
    export let type: ButtonType = ButtonType.Primary;
    export let submit = false;
    export let disabled = false;
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
        justify-content: center;
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
    }
</style>
