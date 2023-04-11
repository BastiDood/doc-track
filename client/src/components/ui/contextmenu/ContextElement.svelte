<script lang="ts">
    import { IconSize } from '../../types.ts';
    import Add from '../../icons/Add.svelte';
    export let iconSize: IconSize = IconSize.Normal;
</script>

<div on:click on:keydown>
    <div>
        <slot name="contextIcon">
            <Add size={iconSize} alt="Placeholder" />
        </slot>
    </div>
    <div><slot></slot></div>
</div>