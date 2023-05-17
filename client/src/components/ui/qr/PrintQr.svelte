<script lang="ts">
    import DownloadButton from '../../icons/DocumentDownload.svelte'; 
    import Button from '../Button.svelte';
    import Modal from '../Modal.svelte';
    import QrGenerator from './QrGenerator.svelte';
    import { ButtonType } from '../../types.ts';

    export let trackingNumber: string;
    const trackingUrl = `localhost:3000/track?id=${trackingNumber}`;

    let showPrintQr = false;
</script>
<Button on:click={() => (showPrintQr = true)}>
    <DownloadButton alt="Download QR" />Download QR Code
</Button>

<Modal title="Print QR Code" bind:showModal={showPrintQr}>
    <QrGenerator URL={trackingNumber} />
    <p>Tracking Number: {trackingUrl}</p>
    <a href={trackingUrl}>Go to Tracking Page</a>
    <span id="bottom">
        <Button submit><DownloadButton alt="Download QR"/> Download QR</Button>
        <a href={trackingUrl}><Button type={ButtonType.Primary}>Go to Tracking Page</Button></a>
    </span>
</Modal>



