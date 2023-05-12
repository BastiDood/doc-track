<script lang="ts">
    import { assert } from '../../../assert.ts';
    import { Batch } from '../../../api/batch.ts';

    import { earliestBatch } from '../stores/BatchStore.ts';
    import { dashboardState } from '../stores/DashboardState.ts';
    import { topToastMessage } from '../stores/ToastStore.ts';

    import GenerateBatch from '../../../components/ui/forms/batch/GenerateBatch.svelte';
    import FetchEarliest from '../../../components/ui/forms/batch/FetchEarliest.svelte';

    import Download from '../../../components/icons/Download.svelte';
    import Add from '../../../components/icons/Add.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import Modal from '../../../components/ui/Modal.svelte';

    $: ({ currentOffice } = $dashboardState);

    let showGenerateBatch = false;
    let showDownloadBatch = false;

    let unused = 0;
    let used = 0;

    async function handleGenerate() {
        if (currentOffice === null) return;
        try {
            // HACK: Type-cast is necessary here because for some reason,
            // ESLint resolves the `currentOffice` as `any` type.
            await Batch.generate(currentOffice as number);
            await earliestBatch.reload?.();
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
</script>

{#if currentOffice === null}
    You must select an office before accessing the Barcodes page.
{:else}
    Barcodes page of Office ID {currentOffice}.
    <h1>Barcodes</h1>
    <main>
        <table>
            <tr>
                <td>Unused</td>
                <td>{unused}</td>
            </tr>
            <tr>
                <td>Used</td>
                <td>{used}</td>
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
