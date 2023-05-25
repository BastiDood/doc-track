<script lang="ts">
    import { assert } from '../../../assert.ts';
    import { Batch } from '../../../api/batch.ts';

    import { earliestBatch } from '../../../stores/BatchStore.ts';
    import { dashboardState } from '../../../stores/DashboardState.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';
    import { barcodeSummary } from '../../../stores/MetricStore.ts';
    import { allOffices } from '../../../stores/OfficeStore.ts';

    import FetchEarliest from '../../../components/ui/forms/batch/FetchEarliest.svelte';

    import Download from '../../../components/icons/Download.svelte';
    import Add from '../../../components/icons/Add.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import { ToastType } from '../../../components/types.ts';

    $: ({ currentOffice } = $dashboardState);
    $: officeName = currentOffice === null ? 'No office name.' : $allOffices[currentOffice];

    let showDownloadBatch = false;

    async function handleGenerate() {
        if (currentOffice === null) return;
        try {
            // HACK: Type-cast is necessary here because for some reason,
            // ESLint resolves the `currentOffice` as `any` type.
            await Batch.generate(currentOffice as number);
            await earliestBatch.reload?.();
            await barcodeSummary.reload?.();
            topToastMessage.enqueue({
                type: ToastType.Success,
                title: 'Batch Generation',
                body: 'You successfully generated a batch of barcodes.',
            });
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }

    async function handleDownload() {
        if (currentOffice === null) return;
        try {
            await earliestBatch.reload?.();
            if ($earliestBatch === null || typeof $earliestBatch === 'undefined')
                topToastMessage.enqueue({
                    type: ToastType.Info,
                    title: 'No available barcodes',
                    body: 'Please generate a new batch.',
                });
            else
                showDownloadBatch = true;
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }

    $: barcodeSum = barcodeSummary.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        return Promise.reject();
    });
</script>

{#if currentOffice === null}
    You must select an office before accessing the Barcodes page.
{:else}
    {#await barcodeSum}
        Loading barcode metrics...
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
                    <Download alt="download" />Download Stickers
                </Button>
                <Button on:click={handleGenerate}>
                    <Add alt="add" /> Generate New Batch
                </Button>
            
                <Modal title="Download Stickers" bind:showModal={showDownloadBatch}>
                    <FetchEarliest />
                </Modal>
            </main>
        {/if}
    {/await}
{/if}

<style>
    main {
        display: flex;
        flex-direction: column;
        height: 100%;
        place-items: center;
    }

    table {
        border-collapse: collapse;
    }

    table, td {
        border: 1px solid;
    }
</style>
