<script lang="ts">
    import { ContainerType } from '../types';

    export let ty: ContainerType;
</script>
<section class="{ty}">
    <slot></slot>
</section>

<style>
    @import url('../../pages/vars.css');

    section {
        margin: var(--spacing-small);
        padding: var(--spacing-large);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-small);
        border-radius: var(--border-radius);
    }

    .enumeration {
        background-color: var(--dashboard-sidedrawer);
        box-shadow: var(--spacing-small) var(--spacing-small) var(--spacing-small) 0px var(--shadow-color);
    }

    .divider {
        border: var(--spacing-tiny) solid var(--secondary-color);
        box-shadow: var(--spacing-normal) var(--spacing-normal) var(--spacing-small) 0px var(--shadow-color);
        background-color: white;
    }
</style>