<script lang="ts">
    import QrScanner from 'qr-scanner';
    import { assert } from '../../assert';
    import { Document } from '~model/document';
    import Button from './Button.svelte';
    import { ButtonType } from '../types';
    import { topToastMessage } from '../../pages/dashboard/stores/ToastStore';
    import z from 'zod'
    import { onMount } from 'svelte';

    function setup() {
        const videoElement = document.getElementById('scan');
        console.log(videoElement)
        assert(videoElement instanceof HTMLVideoElement);

        return new QrScanner(
            videoElement, 
            result => maybeId = z.string().parse(result.data), {
                highlightCodeOutline: true,
                onDecodeError: (err) => topToastMessage.enqueue({title: 'Failed to Find QR code', body: JSON.stringify(err)}),
                returnDetailedScanResult: true,
            }
        )
    }

    async function startCamera() {
        camStart = true;
        return qrScanner?.start();
    }

    function stopCamera() {
        camStart = false;
        return qrScanner?.stop();
    }

    async function handleFileInput() {
        const uploadElement = document.getElementById('file-selector');
        assert(uploadElement instanceof HTMLInputElement);
        assert(uploadElement.files instanceof FileList);
        const [first, ..._] =  uploadElement.files;
        assert(typeof first !== 'undefined');
        try {
            const scanData =  await QrScanner.scanImage(first, {returnDetailedScanResult: true})
            maybeId = z.string().parse(scanData.data)
        } catch (err) {
            topToastMessage.enqueue({title: 'Failed to Find QR code', body: JSON.stringify(err)})
        }
        uploadElement.value = '';
    }
    let camStart = false as boolean;

    onMount(() => {
        qrScanner = setup();
    })
    let qrScanner = null as QrScanner | null;
    export let maybeId = null as Document['id'] | null;
</script>

<video id='scan'><track kind="captions"></video>
{#await QrScanner.hasCamera()}
    Loading cameras.
    {:then hasCamera}
        {#if !hasCamera}
            No cameras detected.
        {:else}
            <header>
                {#if camStart}
                    <Button type={ButtonType.Secondary} on:click={() => stopCamera()}> End Capture </Button>
                {:else}
                    <Button on:click={() => startCamera()}> Start Capture </Button>
                {/if}
            </header>
        {/if}
{/await}
<header>
    Select an ID from a file: <input on:change={() => handleFileInput()} type="file" id="file-selector" accept="image/*">
</header>
<section>
    {#if maybeId === null} 
        No valid QR code dectected
    {:else}
        Read code {maybeId}
    {/if}
</section>
