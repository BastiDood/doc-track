<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { IconSize } from '../../types.ts'
    import Add from '../../icons/Add.svelte';

    export let iconSize = IconSize.Normal();
    export let contextData
    const dispatch = createEventDispatcher();

</script>

<div 
    on:click={() => dispatch('contextEvent')}
    on:keydown={() => dispatch('contextEvent')}
    >
    <div>
        <slot name="contextIcon">
            <Add size={iconSize} />
        </slot>
    </div>

    <div>
        <slot>
            <p>
                Default text
            </p>
        </slot>
    </div>
</div>

<style>
    @import url('../../../pages/global.css');
</style>