<script lang="ts">
    import { userSession } from '../../../../stores/UserStore.ts';
    import { earliestBatch } from '../../../../stores/BatchStore.ts';
    import Button from '../../Button.svelte';
    import QrGenerator from '../../qr/QrGenerator.svelte';

    let printForm = false;
</script>

<div>
    {#if typeof $earliestBatch?.codes === 'undefined'}
        <p>No batch available.</p>
    {:else}
        <p>You successfully fetched the earliest batch as {$userSession?.email}</p>
        {#if printForm}
            <section>
                {#each $earliestBatch.codes as url (url)}
                    <article>
                        <QrGenerator {url} />
                        <div>{url}</div>
                    </article>
                {/each}
            </section>
            <Button on:click={()=> window.print()}>Print Barcodes</Button>
        {:else}
            <Button on:click={()=> (printForm = true)}>Render Barcode Batch</Button>
        {/if}
    {/if}
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
    }

    section {
        display: flex;
        flex-wrap: wrap;
        max-width: 90svw;
        justify-content: center;
    }

    article {
        display: flex;
        flex-direction: column;
        border: 3px dotted black;
        max-width: 148px;
        margin: var(--spacing-tiny);
        pad: var(--spacing-tiny);
    }
</style>
