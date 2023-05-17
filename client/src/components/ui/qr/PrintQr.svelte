<script lang="ts">
    import DownloadButton from '../../icons/DocumentDownload.svelte';
    import Button from '../Button.svelte';
    import Modal from '../Modal.svelte';
    import QrGenerator from './QrGenerator.svelte';
    import { ButtonType } from '../../types.ts';
    

    export let trackingNumber: string;
    const trackingUrl = `http://localhost:3000/track?id=${trackingNumber}`;

    let showPrintQr = false;
</script>
<Button on:click={() => (showPrintQr = true)}>
    <DownloadButton alt="Download QR" />Download QR Code
</Button>

<Modal title="Print QR Code" bind:showModal={showPrintQr}>
    <center>
        <QrGenerator URL={trackingNumber} />
    </center>
    <p>Tracking Number: {trackingNumber}</p>
    <span id="bottom">
        <Button submit><DownloadButton alt="Download QR"/> Download QR</Button>
        <Button type={ButtonType.Primary} on:click={() => (window.print())}>Print</Button>
        <a href={trackingUrl}><Button type={ButtonType.Primary}>Go to Tracking Page</Button></a>
    </span>
</Modal>

<style>
    #bottom {
        display: flex;
        justify-content: space-between;
    }
</style>



