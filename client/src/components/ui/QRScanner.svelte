<script lang="ts">
    import QrScanner from 'qr-scanner';
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import { type Document, DocumentSchema } from '~model/document.ts';

    import Button from './Button.svelte';

    import { assert } from '../../assert.ts';
    import { Events, ButtonType } from '../types.ts';

    import { topToastMessage } from '../../pages/dashboard/stores/ToastStore.ts';

    export let maybeId = null as Document['id'] | null;

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
            maybeId = DocumentSchema.shape.id.parse(data.trim());
            dispatch(Events.OnDocumentScan, maybeId);
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
                maybeId = DocumentSchema.shape.id.parse(result.data.trim());
                stopCamera();
                dispatch(Events.OnDocumentScan, maybeId);
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

<video bind:this={videoElement}><track kind="captions"></video>
{#await QrScanner.hasCamera()}
    Loading cameras...
{:then hasCamera}
    {#if hasCamera}
        <header>
            {#if camStart}
                <Button type={ButtonType.Secondary} on:click={stopCamera}>End Capture</Button>
            {:else}
                <Button on:click={startCamera}>Start Capture</Button>
            {/if}
        </header>
    {:else}
        <p>No cameras available.</p>
    {/if}
{/await}
<header>
    Upload a file with the QR code: <input type="file" accept="image/*" on:change={handleFileInput}>
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
