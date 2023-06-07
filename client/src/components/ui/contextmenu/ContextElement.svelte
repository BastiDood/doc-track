<script lang="ts">
    import { IconSize } from '../../types.ts';
    import Add from '../../icons/Add.svelte';
    export let iconSize: IconSize = IconSize.Normal;
</script>

<div on:click on:keydown>
    <slot name="contextIcon">
        <Add size={iconSize} alt="Placeholder" />
    </slot>
    <slot></slot>
</div>

<style>
    div {
        border: var(--spacing-tiny) solid black;
    }

    div:hover {
        background-color: var(--primary-color);
        color: white;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    div:active {
        background-color: white;
        color: var(--primary-color);
    }
</style>
