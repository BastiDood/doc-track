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
    <div class="header"><slot/></div>
    <div class="subtext"><slot name="secondary"/></div>
    {#if showOverflowIcon}
        <div class="overflow" on:keydown on:click|stopPropagation={() => dispatch(Events.OverflowClick)}>
            <OverflowMenuVertical size={iconSize} alt="Show overflow menu" />
        </div>
    {/if}
</article>

<style>
    @import url('../../pages/vars.css');

    article {
        display: grid;
        border-style: solid;
        border-width: var(--spacing-tiny);
        border-radius: var(--border-radius);
        margin: var(--spacing-small);
        padding: var(--spacing-small);
        grid-row-gap: var(--spacing-small);
        justify-content: space-between;
        grid-template-areas: 
            "a b b b b b c"
            "a d d d d d c";
    }

    .icon {
        grid-area: a;
        align-self: start;
    }

    .overflow {
        grid-area: c;
        align-self: start;
    }
    
    .header {
        grid-area: b;
    }

    .subtext {
        grid-area: d;
        font-size: var(--small);
    }
</style>
