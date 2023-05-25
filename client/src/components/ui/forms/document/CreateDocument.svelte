<script lang="ts">
    import { assert } from '../../../../assert.ts';
    import { createEventDispatcher } from 'svelte';
    import { Document as Api } from '../../../../api/document.ts';

    import { earliestBatch } from '../../../../stores/BatchStore.ts';
    import { categoryList } from '../../../../stores/CategoryStore.ts';
    import { documentOutbox } from '../../../../stores/DocumentStore.ts';
    import { dashboardState } from '../../../../stores/DashboardState.ts';
    import { reloadMetrics } from '../../../../stores/MetricStore.ts';
    import { topToastMessage } from '../../../../stores/ToastStore.ts';
    import { deferredSnaps } from '../../../../stores/DeferredStore.ts';

    import type { Category } from '../../../../.../../../../model/src/category.ts';
    import type { Document } from '../../../../.../../../../model/src/document.ts';
    import { Snapshot, Status } from '../../../../.../../../../model/src/snapshot.ts';
    import { Events, ToastType } from '../../../types.ts';
    
    import { DeferredSnap } from '../../../../api/error.ts';

    import Button from '../../Button.svelte';
    import BarcodeSelect from '../../BarcodeSelect.svelte';
    import CategorySelect from '../../CategorySelect.svelte';
    import TextInput from '../../TextInput.svelte';
    import QrGenerator from '../../qr/QrGenerator.svelte';

    import FileInput from '../../FileInput.svelte';

    let id = null as Document['id'] | null;
    $: url = id === null ? '' : `/track?id=${id}`;

    let category: Category['id'] | null = null;
    let title: Document['title'] = '';
    let remark: Snapshot['remark'] = '';
    const dispatch = createEventDispatcher();

    async function handleSubmit(this: HTMLFormElement) {
        const oid = $dashboardState.currentOffice;
        if (oid === null || id === null || category === null) return;
        try {
            const result = await Api.create(oid, { id, title, category }, remark);
            assert(result instanceof Date);
            await earliestBatch.reload?.();
            await documentOutbox.reload?.();
            await reloadMetrics();
            dispatch(Events.Done);
            topToastMessage.enqueue({
                type: ToastType.Success,
                title: 'Document Creation',
                body: 'You have successfully created a document.',
            });
            this.reset();
        } catch (err) {
            assert(err instanceof Error);
            if (err instanceof DeferredSnap) {
                await deferredSnaps.upsert({ status: Status.Register, doc: id });
                topToastMessage.enqueue({ title: err.name, body: `${id} is deferred.` });
                dispatch(Events.Done);
                return;
            }
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

{#if $earliestBatch === null || typeof $earliestBatch === 'undefined'}
    No available barcodes.
{:else}
    <form on:submit|preventDefault|stopPropagation={handleSubmit}>
        Barcode: <BarcodeSelect bind:code={id} barcodes={$earliestBatch.codes}></BarcodeSelect>
        <br />
        {#if url}
            <div><QrGenerator {url} /></div>
        {/if}
        <TextInput bind:value={title} placeholder="Document Title..." name="title" label="Document Title:"></TextInput>
        <br />
        Category: <CategorySelect bind:catId={category} categories={$categoryList.active} />
        <br />
        <TextInput bind:value={remark} placeholder="Remarks..." name="remark" label="Remark:" required={false}></TextInput> 
        {#if id}
            <FileInput trackingNumber={id} /> 
        {/if}
        <Button submit>Create Document</Button>
    </form>
{/if}

<style>
    div {
        display: flex;
        justify-content: center;
    }
</style>
