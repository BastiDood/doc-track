<script lang="ts">
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { earliestBatch } from '../../../../pages/dashboard/stores/BatchStore.ts';
</script>

<p>You successfully fetched the earliest batch as {$userSession?.email}</p>
{#if typeof $earliestBatch?.codes !== 'undefined'}
    <ul>
        {#each $earliestBatch.codes as code}
            <li>{code}</li>   
        {/each}
    </ul>
{/if}
