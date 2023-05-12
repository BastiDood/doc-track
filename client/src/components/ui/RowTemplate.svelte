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
        <div><slot></slot></div>
        <div class="subtext"><slot name="secondary"></slot></div>
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
    @import url('../../pages/vars.css');

    article {
        align-items: center;
        display: flex;
        border-style: solid;
        border-width: var(--spacing-tiny);
        border-radius: var(--border-radius);
        gap: var(--spacing-normal);
        padding: var(--spacing-small);
    }

    article > div {
        flex: 0 1 auto;
    }

    #middle {
        flex: 1 0 auto;
    }

    .subtext {
        font-size: var(--small);
    }

    .defer {
        border-bottom: var(--spacing-small) var(--offline-color) solid;
    }
</style>
