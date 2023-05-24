<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { Document } from '../../../../.../../../../model/src/document.ts';
    import Button from './Button.svelte';
    import { topToastMessage } from '../../pages/dashboard/stores/ToastStore.ts';
    import { assert } from '../../assert.ts';

    export let trackingNumber = null as Document['id'] | null;
    $: trackingNumber = trackingNumber === null ? '' : `/track?id=${trackingNumber}`;

    let fileUpload = null as File | null;
    const dispatch = createEventDispatcher();

    async function handleSubmit(this: HTMLFormElement) {
        try {
            console.log(`Uploading File ${fileUpload.name}`);
            assert(fileUpload !== null);
            assert(trackingNumber !== null);
            assert(trackingNumber !== '');
            assert(typeof fileUpload !== 'undefined');
            assert(typeof fileUpload.name !== 'undefined');
            
            topToastMessage.enqueue({ title: `Uploading file...`, body: `Name: ${fileUpload.name}` });
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

<span>
    <input bind:value={fileUpload} id="upload" multiple={false} type="file" />  
    {#if typeof fileUpload !== 'undefined' && fileUpload !== null}
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
