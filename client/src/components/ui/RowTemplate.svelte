<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, IconSize } from '../types.ts';

    import OverflowMenuVertical from '../icons/OverflowMenuVertical.svelte';

    export let iconSize: IconSize = IconSize.Large;
    export let title: string;

    const dispatch = createEventDispatcher();
</script>

<article>
    <div class="icon"><slot name="icon" /></div>
    <p>{title}</p>
    <div class="icon" on:keydown on:click|stopPropagation={() => dispatch(Events.OverflowClick)}>
        <OverflowMenuVertical size={iconSize} alt="Show overflow menu" />
    </div>
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

    .icon {
        flex-grow: 0;
    }

    p {
        flex-grow: 1;
        margin: 0;
    }
</style>
