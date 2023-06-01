<script lang="ts">
    import QrScanner from 'qr-scanner';
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import { DocumentSchema } from '../../../../model/src/document.ts';

    import Button from './Button.svelte';

    import { assert } from '../../assert.ts';
    import { Events, ButtonType } from '../types.ts';

    import { topToastMessage } from '../../stores/ToastStore.ts';

    const dispatch = createEventDispatcher();
    let camStart = false as boolean;
    let qrScanner = null as QrScanner | null;
    let videoElement = null as HTMLVideoElement | null;

    async function startCamera() {
        camStart = true;
        await qrScanner?.start();
    }

    function stopCamera() {
        camStart = false;
        return qrScanner?.stop();
    }

    async function handleFileInput(this: HTMLInputElement) {
        assert(this.files !== null);
        const [first, ...rest] = this.files;
        assert(rest.length === 0);
        assert(typeof first !== 'undefined');
        try {
            const { data } = await QrScanner.scanImage(first, { returnDetailedScanResult: true });
            if (!data) return;
            dispatch(Events.OnDocumentScan, DocumentSchema.shape.id.parse(data.trim()));
        } catch (err) {
            topToastMessage.enqueue({ title: 'Failed to Find QR code.', body: JSON.stringify(err) });
        }
        this.value = '';
    }

    function setup() {
        assert(videoElement instanceof HTMLVideoElement);
        return new QrScanner(
            videoElement,
            result => {
                if (!result.data) return;
                stopCamera();
                dispatch(Events.OnDocumentScan, DocumentSchema.shape.id.parse(result.data.trim()));
            },
            {
                highlightCodeOutline: true,
                highlightScanRegion: true,
                maxScansPerSecond: 1,
                returnDetailedScanResult: true,
                onDecodeError(err) {
                    if (err === 'No QR code found') return;
                    topToastMessage.enqueue({ title: 'Failed to Find QR code', body: JSON.stringify(err) });
                },
            },
        );
    }
    
    // Needs to be here so that the <video> tag is rendered before it is asserted
    onMount(() => (qrScanner = setup()));

    // Otherwise, when the window is closed - browser still thinks you are recording.
    onDestroy(stopCamera);
</script>

<div>
    <video bind:this={videoElement}><track kind="captions"></video>
    {#await QrScanner.hasCamera()}
        Loading cameras...
    {:then hasCamera}
        {#if hasCamera}
                {#if camStart}
                    <p> No valid QR code detected. </p>
                    <Button type={ButtonType.Secondary} on:click={stopCamera}>End Capture</Button>
                {:else}
                    <Button on:click={startCamera}>Start Capture</Button>
                {/if}
        {:else}
            <p>No cameras available.</p>
        {/if}
    {/await}
        <p>Upload a file with the QR code: </p>
        <input type="file" accept="image/*" on:change={handleFileInput}>
</div>

<style>
    div {
        display: flex;
        flex-direction: column;   
    }
    
    video {
        height: 400px;   
        border: var(--primary-color) var(--spacing-normal);
        display: block;
    }
</style>
