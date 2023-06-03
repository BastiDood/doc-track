<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, IconSize } from '../types.ts';

    import OverflowMenuVertical from '../icons/OverflowMenuVertical.svelte';

    export let iconSize: IconSize = IconSize.Large;
    export let showOverflowIcon = true;
    export let isDeferred = false as boolean;

    const dispatch = createEventDispatcher();
</script>

<article class:defer={isDeferred} on:keydown on:click={() => dispatch(Events.RowContainerClick)}>
    <div class="icon"><slot name="icon" /></div>
    <div id="middle">
        <div class="mid-space"><slot></slot></div>
        <div class="mid-space"><slot name="secondary"></slot></div>
    </div>
    {#if showOverflowIcon}
        <div class="overflow" on:keydown on:click|stopPropagation={() => dispatch(Events.OverflowClick)}>
            <slot name="overflow">
                <OverflowMenuVertical size={iconSize} alt="Show Overflow Menu" />
            </slot>
        </div>
    {/if}
</article>

<style>
    article {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-style: solid;
        border-width: var(--spacing-tiny);
        border-radius: var(--border-radius);
        gap: var(--spacing-normal);
        padding: var(--spacing-normal);
        background-color: white;
    }

    article > div {
        flex: 0 1 auto;
    }
    

    #middle {
        flex: 1 auto;
    }

    .mid-space {
        padding: var(--spacing-small);
    }

    .defer {
        border-bottom: var(--spacing-small) var(--offline-color) solid;
    }
</style>
