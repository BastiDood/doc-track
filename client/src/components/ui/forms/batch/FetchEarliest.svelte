<script lang="ts">
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { earliestBatch } from '../../../../pages/dashboard/stores/BatchStore.ts';
</script>

{#if typeof $earliestBatch?.codes === 'undefined'}
    <p>No batch available.</p>
{:else}
    <p>You successfully fetched the earliest batch as {$userSession?.email}</p>
    <ul>
        {#each $earliestBatch.codes as code}
            <li>{code}</li>   
        {/each}
    </ul>
{/if}
