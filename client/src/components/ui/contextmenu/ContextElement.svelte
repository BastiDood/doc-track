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
    div:hover {
        cursor: pointer;
        background-color: var(--primary-color);
        color: white;
        transition: 0.3s;
        border: var(--spacing-tiny) solid black;
    }
</style>
