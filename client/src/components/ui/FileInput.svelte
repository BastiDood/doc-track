<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Modal from './Modal.svelte';
    import Button from './Button.svelte';
    import { topToastMessage } from '../../stores/ToastStore';
    import { assert } from '../../assert.ts';
    import DownloadButton from '../icons/DocumentDownload.svelte';

    export let trackingNumber = null as string | null;
    export let maxLimit = 20971520;
    $: trackingNumber = trackingNumber === null ? '' : `/track?id=${trackingNumber}`;

    let files = null as FileList | null;
    let toUpload = null as File | null;
    let path = null as string | null;
    let showFileInput = false;
    let outputText = '';
    let maxLimitText = '';

    $: outputText = outputText === '' ? '' : outputText;
    // Get first element from FileList
    $: if (files)
        for (const file of files) toUpload = file;

    function convertToScale(bytes: number) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = Math.floor(Math.log(bytes + 1) / Math.log(1024));
        if (i > 4) return 'File size unsupported';
        return `${Math.round((bytes + 1) / 1024 ** i)} ${sizes[i]}`;
    }

    $: maxLimitText = convertToScale(maxLimit);

    function validateFile() {
        if (typeof files === 'undefined' || !files) return false;
        if (!toUpload || typeof toUpload === 'undefined') return false;
        outputText = toUpload.size > maxLimit ? `File size must be less than ${maxLimitText}.` : `Size: ${convertToScale(toUpload.size)}`;
        return toUpload.size <= maxLimit;
    }

    function handleSubmit(this: HTMLFormElement) {
        try {
            // We still have to call these due to linting not detecting validateFile() checkers.
            assert(files !== null);
            assert(trackingNumber !== null);
            assert(trackingNumber !== '');
            assert(typeof files !== 'undefined' && files);
            assert(toUpload && typeof toUpload !== 'undefined');

            if (!validateFile()) return;
            console.log(`Successfully uploaded file "${toUpload.name}" (${toUpload.size} bytes)`);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

<Button on:click={() => (showFileInput = true)}>
    <DownloadButton alt="Download Button" />Browse from system...
</Button>
<Modal title="Upload File" bind:showModal={showFileInput}>
    <input bind:files on:change={validateFile} bind:value={path} id="upload" multiple={false} type="file" capture={true} />  
    {#if typeof files !== 'undefined' && files !== null}
        <br>
        <p id="error">File Size: {outputText}</p>
        <Button on:click={handleSubmit}>Upload "{toUpload?.name ?? 'No file Selected'}"</Button>
    {/if}
</Modal>

<style>
    @import url('../../pages/vars.css');

    #error {
        color: var(--danger-color);
        display: block;
    }
</style>    
