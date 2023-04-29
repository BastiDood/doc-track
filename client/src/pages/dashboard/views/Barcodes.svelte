<script lang="ts">
    import { dashboardState } from '../stores/DashboardState.ts';
    import { Batch } from '../../../api/batch.ts';
    import { earliestBatch } from '../../dashboard/stores/BatchStore.ts';

    import GenerateBatch from '../../../components/ui/forms/batch/GenerateBatch.svelte';
    import FetchEarliest from '../../../components/ui/forms/batch/FetchEarliest.svelte';

    import Download from '../../../components/icons/Download.svelte';
    import Barcode from '../../../components/icons/Barcode.svelte';
    import Add from '../../../components/icons/Add.svelte';

    import TextInput from '../../../components/ui/TextInput.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import Modal from '../../../components/ui/Modal.svelte';

    import { ButtonType } from '../../../components/types.ts';

    $: ({ currentOffice } = $dashboardState);

    let showGenerateBatch = false;
    let showDownloadBatch = false;

    async function handleGenerate() {
        if (currentOffice === null) return;
        try {
            // HACK: Type-cast is necessary here because for some reason,
            // ESLint resolves the `currentOffice` as `any` type.
            await Batch.generate(currentOffice as number);
            await earliestBatch.reload?.();
            showGenerateBatch = true;
        } catch (err) {
            // TODO: error message
            alert(err);
        }
    }

    async function handleDownload() {
        if (currentOffice === null) return;
        try {
            await earliestBatch.reload?.();
            showDownloadBatch = true;
        } catch (err) {
            // TODO: error message
            alert(err);
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
                <td>0</td>
            </tr>
            <tr>
                <td>Used</td>
                <td>0</td>
            </tr>
            <tr>
                <td>Valid</td>
                <td>0</td>
            </tr>
        </table>
    
        <div class="invalidate-container">
            <TextInput label='id' placeholder='ID' name='invalidate-id'>Invalide ID</TextInput>
            <Button type={ButtonType.Danger}><Barcode alt='barcode' />Submit</Button>
        </div>
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

    .invalidate-container {
        display: flex;
        align-items: baseline;
    }

    table {
        border-collapse: collapse;
    }

    table, td {
        border: 1px solid;
    }
</style>
