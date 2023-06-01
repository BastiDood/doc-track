<script lang="ts">
    import DownloadButton from '../../icons/DocumentDownload.svelte';
    import Button from '../Button.svelte';
    import Modal from '../Modal.svelte';
    import QrGenerator from './QrGenerator.svelte';
    import { ButtonType, IconColor } from '../../types.ts';
    import Close from '../../icons/Close.svelte';
    
    export let trackingNumber: string;
    export let showText = false as boolean;
    export let allowRedirect = true as boolean;
    let showPrintQr = false;

    $: trackingUrl = `/track?id=${trackingNumber}`;
</script>

<Button on:click={() => (showPrintQr = true)}>
    <DownloadButton color={IconColor.White} alt="Download icon for printing QR codes" />
    {#if showText}
        Print QR Code
    {/if}
</Button>
<Modal title="Print QR Code" bind:showModal={showPrintQr}>
    <center>
        <QrGenerator url={trackingNumber} />
    </center>
    {#if allowRedirect}
        <p>Tracking Number: <a href={trackingUrl}>{trackingNumber}</a></p>
    {:else}
        <p>Tracking Number: {trackingNumber}</p>
    {/if}
    <div id="bottom">
        <Button type={ButtonType.Primary} on:click={() => window.print()}>Print</Button>
        <Button type={ButtonType.Danger} on:click={() => (showPrintQr = false)}><Close alt="Close" color={IconColor.White}/> Close</Button>
    </div>
</Modal>

<style>
    #bottom {
        display: flex;
        justify-content: space-between;
    }
</style>
