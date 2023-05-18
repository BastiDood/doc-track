<script lang="ts">
    import QrScanner from 'qr-scanner';
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import { Events, ButtonType } from '../types';
    import { assert } from '../../assert';
    import { Document, DocumentSchema } from '../../../../model/src/document.ts';

    import { topToastMessage } from '../../pages/dashboard/stores/ToastStore';
    import Button from './Button.svelte';

    export let maybeId = null as Document['id'] | null;

    const dispatch = createEventDispatcher();
    let camStart = false as boolean;
    let qrScanner = null as QrScanner | null;
    let videoElement = null as HTMLVideoElement | null;
    let uploadElement = null as HTMLInputElement | null;

    async function startCamera() {
        camStart = true;
        await qrScanner?.start();
    }

    function stopCamera() {
        camStart = false;
        return qrScanner?.stop();
    }

    async function handleFileInput(this: HTMLInputElement) {
        assert(this.files instanceof FileList);
        const [first] = this.files;
        assert(typeof first !== 'undefined');
        try {
            const scanData = await QrScanner.scanImage(first, { returnDetailedScanResult: true });
            if (scanData.data === '') return;
            maybeId = DocumentSchema.shape.id.parse(scanData.data.trim());
            dispatch(Events.OnDocumentScan, maybeId);
        } catch (err) {
            topToastMessage.enqueue({ title: 'Failed to Find QR code', body: JSON.stringify(err) });
        }
        // eslint-disable-next-line require-atomic-updates
        this.value = '';
    }

    function setup() {
        assert(videoElement instanceof HTMLVideoElement);

        return new QrScanner(
            videoElement,
            result => {
                if (result.data === '') return;
                maybeId = DocumentSchema.shape.id.parse(result.data.trim());
                stopCamera();
                dispatch(Events.OnDocumentScan, maybeId);
            }, {
                highlightCodeOutline: true,
                highlightScanRegion: true,
                onDecodeError: (err) => {
                    if (err === 'No QR code found') return;
                    topToastMessage.enqueue({ title: 'Failed to Find QR code', body: JSON.stringify(err) });
                },
                maxScansPerSecond: 1,
                returnDetailedScanResult: true,
            }
        );
    }
    
    onMount(() => {
        // Needs to be here so that the <video> tag is rendered before it is asserted
        qrScanner = setup();
    });

    onDestroy(() => {
        // Otherwise, when the window is closed - browser still thinks you are recording.
        stopCamera();
    });
</script>

<video bind:this={videoElement}><track kind="captions"></video>
{#await QrScanner.hasCamera()}
    Loading cameras...
    {:then hasCamera}
        {#if hasCamera}
        <header>
            {#if camStart}
                <Button type={ButtonType.Secondary} on:click={stopCamera}> End Capture </Button>
            {:else}
                <Button on:click={startCamera}> Start Capture </Button>
            {/if}
        </header>
        {:else}
            <p> No cameras available. </p>
        {/if}
{/await}
<header>
    Upload a file with the QR code: <input bind:this={uploadElement} on:change={handleFileInput} type="file" id="file-selector" accept="image/*">
</header>
{#if maybeId === null || maybeId === ''} 
    <p> No valid QR code detected. </p>
{/if}

<style>
    video {
        height: 400px;   
        border: var(--primary-color) var(--spacing-normal);
        display: block;
    }
</style>