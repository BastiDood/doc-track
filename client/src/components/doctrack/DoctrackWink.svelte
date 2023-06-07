<script lang="ts">
    import Doctrack from '../icons/Doctrack.svelte';
    import DoctrackWink from '../icons/DoctrackWink.svelte';

    let isWinked = false;
</script>

<div on:mouseenter={() => (isWinked = true)} on:mouseleave={() => (isWinked = false)}>
    {#if isWinked}
        <DoctrackWink alt="see help page" />
    {:else}
        <Doctrack alt="see help page" />
    {/if}
</div>

<style>
    div {
        cursor: pointer;
    }
</style>
