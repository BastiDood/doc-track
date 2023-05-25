<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Modal from './Modal.svelte';
    import Button from './Button.svelte';
    import { topToastMessage } from '../../stores/ToastStore';
    import { assert } from '../../assert.ts';
    import DownloadButton from '../icons/DocumentDownload.svelte';

    export let trackingNumber = null as string | null;
    $: trackingNumber = trackingNumber === null ? '' : `/track?id=${trackingNumber}`;

    let files = null as FileList | null;
    let toUpload = null as File | null;
    let path = null as string | null;
    let showFileInput = false;
    export let maxLimit = 20000000;
    $: if (files) {
		for (const file of files) {
			toUpload = file;
		}
	}
    const dispatch = createEventDispatcher();
    function validateFile(file: File) {
        if (file.size > maxLimit) {
            throw new Error(`File size must be less than ${maxLimit} bytes.`);
        }
    }

    async function handleSubmit(this: HTMLFormElement) {
        try {
            assert(files !== null);    
            assert(trackingNumber !== null);
            assert(trackingNumber !== '');
            assert(typeof files !== 'undefined' && files);
            assert(toUpload && typeof toUpload !== 'undefined');    
            if(toUpload.size > maxLimit) {
                console.log("Invalid file");
                topToastMessage.enqueue({ title: 'File too large', body: `File size must be less than ${maxLimit} bytes.` });
                files = null;
                toUpload = null;
                path = null;
                return;
            }
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
        <Button on:click={handleSubmit}>Upload "{toUpload?.name ?? 'No file Selected'}"</Button>
    {/if}
</Modal>

<style>
    @import url('../../pages/vars.css');
    span {
        border: 1px solid var(--color-primary);
        display: inline-block;
        padding: var(--padding-small);
    }
</style>    
