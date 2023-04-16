<script lang="ts">
    import { Office } from '~model/office';
    import { dashboardState } from '../stores/DashboardState';

    import GenerateBatch from '../../../components/ui/forms/batch/GenerateBatch.svelte'
    import FetchEarliestBatch from '../../../components/ui/forms/batch/FetchEarliestBatch.svelte';

    import Download from '../../../components/icons/Download.svelte';
    import Barcode from '../../../components/icons/Barcode.svelte';
    import Add from '../../../components/icons/Add.svelte';

    import TextInput from '../../../components/ui/TextInput.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import Modal from '../../../components/ui/Modal.svelte';

    import { ButtonType } from '../../../components/types.ts'
    

    let currentOffice: Office['id'] | null = null;

    // eslint-disable-next-line prefer-destructuring
    $: if ($dashboardState.currentOffice !== null) currentOffice = $dashboardState.currentOffice;

    let showGenerateBatch = false;
    let showDownloadBatch = false;
</script>

{#if currentOffice === null}
    You must select an office before accessing the Barcodes page.
{:else}
    Barcodes page of Office ID {currentOffice}.
    <h1>Barcodes</h1>
{/if}

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
    <Button on:click={() => (showDownloadBatch = true)}>
        <Download alt='download' />Download Stickers
    </Button>
    <Button on:click={() => (showGenerateBatch = true)}>
        <Add alt='add'/> Generate New Batch
    </Button>

    <Modal title="Download Stickers" bind:showModal={showDownloadBatch}>
        <FetchEarliestBatch />
    </Modal>

    <Modal title="Generate New Batch" bind:showModal={showGenerateBatch}>
        <GenerateBatch />
    </Modal>

    
</main>

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
