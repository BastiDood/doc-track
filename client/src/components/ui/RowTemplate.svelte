<script lang="ts">
    import './row-element.css';
    import { createEventDispatcher } from 'svelte';
    import DocumentBlank from '../Icons/DocumentBlank.svelte';
    import OverflowMenuVertical from '../Icons/OverflowMenuVertical.svelte';


    let showActionIcons: boolean = false;
    const dispatch = createEventDispatcher();
</script>

<div 
    class="parentContainer" 
    on:mouseenter={() => showActionIcons = true} 
    on:focus={() => showActionIcons = true} 
    on:mouseleave={() => showActionIcons = false}
>
    
    <div class="itemIcon"     
    on:click
    on:keydown>
        <slot name="displayIcon">
            <DocumentBlank/>
        </slot>
    </div>
    <div class="itemText"
    on:click
    on:keydown
    >
        <slot>
            Default slot Text.
        </slot>
    </div>
    <div class="actionIcon">
        {#if (showActionIcons)}
            <slot name="actionIcons">
            </slot>
        {/if}
        
        <OverflowMenuVertical on:click={() => dispatch('overflowclick')}/>
    </div>
</div>