<script lang="ts">
    import Button from './Button.svelte';
    import DownloadButton from '../icons/DocumentDownload.svelte';
    import Modal from './Modal.svelte';
    import { assert } from '../../assert.ts';
    import { topToastMessage } from '../../stores/ToastStore';

    export let trackingNumber = null as string | null;
    export let maxLimit = 20971520;
    $: trackingNumber = trackingNumber === null ? '' : `/track?id=${trackingNumber}`;

    let files = null as FileList | null;
    let maxLimitText = '';
    let outputText = '';
    let path = null as string | null;
    let showFileInput = false;
    export let toUpload = null as File | null;

    $: outputText = outputText === '' ? '' : outputText;
    // Get first element from FileList
    $: if (files)
        for (const file of files) toUpload = file;

    function convertToScale(bytes: number) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        let i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4);
        return `${Math.round(bytes / 1024 ** i)} ${sizes[i] ?? sizes[4]}`;
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
            showFileInput = false;
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
        <p id="upload-feedback">{outputText}</p>
        <Button on:click={handleSubmit}>Upload "{toUpload?.name ?? 'No file Selected'}"</Button>
    {/if}
</Modal>

<style>
    @import url('../../pages/vars.css');

    #upload-feedback {
        color: var(--danger-color);
        display: block;
    }
</style>    
