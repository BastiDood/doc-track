<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { Document } from '../../api/document.ts';
    import Button from './Button.svelte';
    import { topToastMessage } from '../../pages/dashboard/stores/ToastStore.ts';
    import { assert } from '../../assert.ts';

    export let trackingNumber = null as Document['id'] | null;
    $: trackingNumber = trackingNumber === null ? '' : `/track?id=${trackingNumber}`;

    let files = null as FileList | null;
    let toUpload = null as File | null;
    $: if (files) {
		for (const file of files) {
			toUpload = file;
		}
	}
    const dispatch = createEventDispatcher();

    async function handleSubmit(this: HTMLFormElement) {
        try {
            assert(files !== null);    
            assert(trackingNumber !== null);
            assert(trackingNumber !== '');
            assert(typeof files !== 'undefined' && files);
            assert(toUpload && typeof toUpload !== 'undefined');    
            console.log(`Successfully uploaded file "${toUpload.name}" (${toUpload.size} bytes)`);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

<span>
    <input bind:files id="upload" multiple={false} type="file" capture={true} />  
    {#if typeof files !== 'undefined' && files !== null}
        <Button on:click={handleSubmit}>Upload</Button>
    {/if}
</span>

<style>
    @import url('../../pages/vars.css');
    span {
        border: 1px solid var(--color-primary);
        display: inline-block;
        padding: var(--padding-small);
    }
</style>    
