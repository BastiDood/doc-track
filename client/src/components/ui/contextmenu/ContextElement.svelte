<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { IconSize } from '../../types.ts'
    import Add from '../../icons/Add.svelte';

    export let iconSize = IconSize.Normal;
    const dispatch = createEventDispatcher();
</script>

<div on:click on:keydown>
    <div>
        <slot name="contextIcon">
            <Add size={iconSize} alt="Placeholder"/>
        </slot>
    </div>
    <div><slot></slot></div>
</div>

<style>
    @import url('../../../pages/global.css');
</style>