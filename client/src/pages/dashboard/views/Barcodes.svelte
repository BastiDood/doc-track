<script lang="ts">
    import { assert } from '../../../assert.ts';
    import { Batch } from '../../../api/batch.ts';
    import { BarcodeMetrics } from '~model/api.ts';

    import { earliestBatch } from '../stores/BatchStore.ts';
    import { dashboardState } from '../stores/DashboardState.ts';
    import { topToastMessage } from '../stores/ToastStore.ts';
    import { barcodeSummary } from '../stores/MetricStore.ts';
    import { allOffices } from '../stores/OfficeStore.ts';

    import GenerateBatch from '../../../components/ui/forms/batch/GenerateBatch.svelte';
    import FetchEarliest from '../../../components/ui/forms/batch/FetchEarliest.svelte';

    import Download from '../../../components/icons/Download.svelte';
    import Add from '../../../components/icons/Add.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import Modal from '../../../components/ui/Modal.svelte';

    $: ({ currentOffice } = $dashboardState);
    $: officeName = currentOffice === null ? 'No office name.' : $allOffices[currentOffice];

    let showGenerateBatch = false;
    let showDownloadBatch = false;

    async function handleGenerate() {
        if (currentOffice === null) return;
        try {
            // HACK: Type-cast is necessary here because for some reason,
            // ESLint resolves the `currentOffice` as `any` type.
            await Batch.generate(currentOffice as number);
            await earliestBatch.reload?.();
            await barcodeSummary.reload?.();
            showGenerateBatch = true;
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }

    async function handleDownload() {
        if (currentOffice === null) return;
        try {
            await earliestBatch.reload?.();
            showDownloadBatch = true;
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }

    $: console.log($barcodeSummary)
</script>

{#if currentOffice === null}
    You must select an office before accessing the Barcodes page.
{:else}
    {#await barcodeSummary.load()}
        Loading barcodeSummary.
    {:then} 
        {#if $barcodeSummary === null}
            No office is selected.
        {:else}
            Barcodes page of office {officeName}.
            <h1>Barcodes</h1>
            <main>
                <table>
                    <tr>
                        <td>Unused</td>
                        <td>{$barcodeSummary.pending}</td>
                    </tr>
                    <tr>
                        <td>Used</td>
                        <td>{$barcodeSummary.assigned}</td>
                    </tr>
                </table>
                <br />
                
                <Button on:click={handleDownload}>
                    <Download alt='download' />Download Stickers
                </Button>
                <Button on:click={handleGenerate}>
                    <Add alt='add'/> Generate New Batch
                </Button>
            
                <Modal title="Download Stickers" bind:showModal={showDownloadBatch}>
                    <FetchEarliest />
                </Modal>
            
                <Modal title="Generate New Batch" bind:showModal={showGenerateBatch}>
                    <GenerateBatch />
                </Modal>
            </main>
        {/if}
    {/await}
{/if}

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    table {
        border-collapse: collapse;
        width: 20vw;
    }

    table, td {
        border: 1px solid;
    }
</style>
