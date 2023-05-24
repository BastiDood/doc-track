<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Document } from '../../../../.../../../../model/src/document.ts';
    import Button from './Button.svelte';
    import { topToastMessage } from '../../pages/dashboard/stores/ToastStore.ts';
    import { assert } from '../../assert.ts';

    export let trackingNumber = null as Document['id'] | null;
    $: trackingNumber = trackingNumber === null ? '' : `/track?id=${id}`;

    let fileUpload = null as File | null;
    const dispatch = createEventDispatcher();

    async function handleSubmit(this: HTMLFormElement) {

        try {
            topToastMessage.enqueue({ title: `Uploading ifle...`, body: `Name: ${fileUpload.name}` });
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>
<span>
    <input bind:files={fileUpload} id="upload" multiple={false} type="file" />  
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