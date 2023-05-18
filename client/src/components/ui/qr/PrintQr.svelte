<script lang="ts">
    import DownloadButton from '../../icons/DocumentDownload.svelte';
    import Button from '../Button.svelte';
    import Modal from '../Modal.svelte';
    import QrGenerator from './QrGenerator.svelte';
    import { ButtonType } from '../../types.ts';
    import Close from '../../icons/Close.svelte';
    
    export let trackingNumber: string;
    const trackingUrl = `http://localhost:3000/track?id=${trackingNumber}`;

    let showPrintQr = false;
</script>
<Button on:click={() => (showPrintQr = true)}>
    <DownloadButton />Download
</Button>

<Modal title="Print QR Code" bind:showModal={showPrintQr}>
    <center>
        <QrGenerator URL={trackingNumber} />
    </center>
    <p>Tracking Number: <a href={trackingUrl}>{trackingNumber}</a></p>
    <span id="bottom">
        <Button type={ButtonType.Primary} on:click={() => window.print()}>Print</Button>
        <Button type={ButtonType.Danger} on:click={() => (showPrintQr = false)}><Close alt="Close" />Close</Button>
    </span>
</Modal>

<style>
    #bottom {
        display: flex;
        justify-content: space-between;
    }
</style>



