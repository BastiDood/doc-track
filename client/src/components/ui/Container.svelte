<script lang="ts">
    import { fade } from 'svelte/transition';
    import { quadInOut } from 'svelte/easing';

    import { ContainerType } from '../types.ts';

    export let ty: ContainerType;
</script>

<section class={ty} in:fade={{ duration: 100, easing: quadInOut }}>
    <slot></slot>
</section>

<style>
    section {
        margin: var(--spacing-small);
        padding: var(--spacing-large);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-small);
        border-radius: var(--border-radius);
    }

    .enumeration {
        background-color: var(--dashboard-sidedrawer);
        box-shadow: var(--spacing-small) var(--spacing-small) var(--spacing-small) 0 var(--shadow-color);
    }

    .divider {
        border: var(--spacing-tiny) solid var(--secondary-color);
        box-shadow: var(--spacing-normal) var(--spacing-normal) var(--spacing-small) 0 var(--shadow-color);
        background-color: white;
    }
</style>
