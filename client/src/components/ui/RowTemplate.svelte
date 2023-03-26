<script lang="ts">
    import './row-element.css';
    import { createEventDispatcher } from 'svelte';

    import { IconSize } from '../types.ts'
    import DocumentBlank from '../icons/DocumentBlank.svelte';
    import OverflowMenuVertical from '../icons/OverflowMenuVertical.svelte';

    export let iconSize = IconSize.Normal;
    const dispatch = createEventDispatcher();
    let showActionIcons = false;

    function toggleOn() {
        showActionIcons = true;
    }

    function toggleOff() {
        showActionIcons = false;
    }
</script>

<div 
    class="parentContainer" 
    on:mouseenter={toggleOn} 
    on:focus={toggleOn} 
    on:mouseleave={toggleOff}
>
    <div
        class="itemIcon"     
        on:click
        on:keydown
    >
        <slot name="displayIcon">
            <DocumentBlank size={iconSize} />
        </slot>
    </div>
    <div
        class="itemText"
        on:click
        on:keydown
    >
        <slot>
            Default slot Text.
        </slot>
    </div>
    <div class="actionIcon">
        {#if showActionIcons}
            <slot name="actionIcons">
            </slot>
        {/if}
        <OverflowMenuVertical size={iconSize} on:click={() => dispatch('overflowclick')} />
    </div>
</div>
