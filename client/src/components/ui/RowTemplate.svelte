<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, IconSize } from '../types.ts';

    import OverflowMenuVertical from '../icons/OverflowMenuVertical.svelte';

    export let iconSize: IconSize = IconSize.Large;
    export let showOverflowIcon = true;

    const dispatch = createEventDispatcher();
</script>

<article on:keydown on:click|stopPropagation={() => dispatch(Events.RowContainerClick)}>
    <div class="icon"><slot name="icon" /></div>
    <div id="middle">
        <div><slot/></div>
        <div class="subtext"><slot name="secondary"/></div>
    </div>
    {#if showOverflowIcon}
        <div class="overflow" on:keydown on:click|stopPropagation={() => dispatch(Events.OverflowClick)}>
            <OverflowMenuVertical size={iconSize} alt="Show overflow menu" />
        </div>
    {/if}
</article>

<style>
    @import url('../../pages/vars.css');

    article {
        display: flex;
        border-style: solid;
        border-width: var(--spacing-tiny);
        border-radius: var(--border-radius);
        margin: var(--spacing-small);
        padding: var(--spacing-small);
    }

    article > div {
        flex: 0 1 auto;
    }

    #middle {
        flex: 0 0 auto;
    }

    .subtext {
        font-size: var(--small);
    }
</style>
