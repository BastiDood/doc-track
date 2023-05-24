<script lang="ts">
    import QRCode from 'qrcode';

    import { assert } from '../../../assert.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';

    export let url: string;

    $: qrCode = QRCode.toDataURL(url).catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        return null;
    });
</script> 

{#await qrCode}
    <p>Generating QR Code...</p>
{:then dataUrl}
    {#if dataUrl === null}
        <p>Failed to generate QR code.</p>
    {:else}
        <img src={dataUrl} alt="QR Code" />
    {/if}
{/await}
