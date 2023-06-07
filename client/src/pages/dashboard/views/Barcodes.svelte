<script lang="ts">
    import { assert } from '../../../assert.ts';
    import { Batch } from '../../../api/batch.ts';
    import { ContainerType, IconColor, ToastType } from '../../../components/types.ts';

    import { earliestBatch } from '../../../stores/BatchStore.ts';
    import { dashboardState } from '../../../stores/DashboardState.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';
    import { barcodeSummary } from '../../../stores/MetricStore.ts';

    import Add from '../../../components/icons/Add.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import Container from '../../../components/ui/Container.svelte';
    import Download from '../../../components/icons/Download.svelte';
    import FetchEarliest from '../../../components/ui/forms/batch/FetchEarliest.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PageUnavailable from './PageUnavailable.svelte';

    $: ({ currentOffice } = $dashboardState);

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

    const barcodeSumReady = barcodeSummary.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });
</script>

{#if currentOffice === null}
    <p>You must select an office before accessing the Barcodes page.</p>
{:else}
    {#await barcodeSumReady}
        <p>Loading barcode metrics...</p>
    {:then} 
        <h1>Barcodes</h1>
        <Container ty={ContainerType.Divider}>
            <section>
                {#if $barcodeSummary === null}
                    <p>No office is selected.</p>
                {:else}
                    <table>
                        <thead>
                            <tr>
                                <td>Barcode Status</td>
                                <td>Amount of Barcodes</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Unused</td>
                                <td>{$barcodeSummary.pending}</td>
                            </tr>
                            <tr>
                                <td>Used</td>
                                <td>{$barcodeSummary.assigned}</td>
                            </tr>
                        </tbody>
                    </table>    
                    <Button on:click={handleDownload}>
                        <Download alt="download" color={IconColor.White} />Download Stickers
                    </Button>
                    <Button on:click={handleGenerate}>
                        <Add alt="add" color={IconColor.White} /> Generate New Batch
                    </Button>
                    <Modal title="Download Stickers" bind:showModal={showDownloadBatch}>
                        <FetchEarliest />
                    </Modal>
                {/if}
            </section>
        </Container>
    {:catch err}
        <PageUnavailable {err} />
    {/await}
{/if}

<style>
    section {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>
