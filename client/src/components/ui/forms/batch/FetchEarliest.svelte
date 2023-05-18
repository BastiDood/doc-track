<script lang="ts">
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { earliestBatch } from '../../../../pages/dashboard/stores/BatchStore.ts';
    import PrintQr from '../../qr/PrintQr.svelte';
</script>

{#if typeof $earliestBatch?.codes === 'undefined'}
    <p>No batch available.</p>
{:else}
    <p>You successfully fetched the earliest batch as {$userSession?.email}</p>
    <ul>
        {#each $earliestBatch.codes as code (code)}
            <li><PrintQr trackingNumber={code} /> {code}</li>   
        {/each}
    </ul>
{/if}
