<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, IconSize } from '../types.ts';

    import OverflowMenuVertical from '../icons/OverflowMenuVertical.svelte';

    export let iconSize = IconSize.Normal;
    export let title: string;

    const dispatch = createEventDispatcher();
</script>

<div id="parent">
    <div class="icon"><slot name="icon" /></div>
    <p>{title}</p>
    <div class="icon" on:keydown on:click|stopPropagation={() => dispatch(Events.OverflowClick)}>
        <OverflowMenuVertical size={iconSize} alt="Show overflow menu"/>
    </div>
</div>

<style>
    @import url('../../pages/vars.css');

    #parent {
        display: flex;
        border-style: solid;
        padding: var(--spacing-small);
    }

    .icon {
        flex-grow: 0;
    }

    p {
        flex-grow: 1;
        margin: 0;
    }
</style>
