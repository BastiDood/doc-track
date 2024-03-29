<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { z } from 'zod';

    import type { Category } from '~model/category.ts';
    import type { Document } from '~model/document.ts';
    import { Snapshot, Status } from '../../../../.../../../../model/src/snapshot.ts';

    import { Document as Api } from '../../../../api/document.ts';
    import { DeferredSnap } from '../../../../api/error.ts';

    import { assert } from '../../../../assert.ts';
    import { Events, IconColor, ToastType } from '../../../types.ts';

    import { earliestBatch } from '../../../../stores/BatchStore.ts';
    import { categoryList } from '../../../../stores/CategoryStore.ts';
    import { documentOutbox } from '../../../../stores/DocumentStore.ts';
    import { dashboardState } from '../../../../stores/DashboardState.ts';
    import { reloadMetrics } from '../../../../stores/MetricStore.ts';
    import { topToastMessage } from '../../../../stores/ToastStore.ts';
    import { deferredSnaps } from '../../../../stores/DeferredStore.ts';

    import Button from '../../Button.svelte';
    import BarcodeSelect from '../../BarcodeSelect.svelte';
    import CategorySelect from '../../CategorySelect.svelte';
    import QrGenerator from '../../qr/QrGenerator.svelte';
    import TextInput from '../../TextInput.svelte';
    import DocumentAdd from '../../../icons/DocumentAdd.svelte';

    let id = null as Document['id'] | null;
    let category: Category['id'] | null = null;
    let title: Document['title'] = '';
    let remark: Snapshot['remark'] = '';
    let fileList = null as FileList | null;
    $: [file, ...rest] = fileList ?? [];

    const dispatch = createEventDispatcher();

    const MAX_FILE_SIZE = 20971520;
    const SIZES = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    function convertToScale(bytes: number) {
        if (bytes === 0) return '0 Byte';
        const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4);
        const size = SIZES[i];
        assert(typeof size !== 'undefined');
        return `${Math.round(bytes / 1024 ** i)} ${size}`;
    }

    async function handleSubmit(this: HTMLFormElement) {
        if (!this.reportValidity()) return;

        const oid = $dashboardState.currentOffice;
        if (oid === null) return;

        const blob = z.instanceof(File).parse(file);
        assert(z.instanceof(File).array().parse(rest).length === 0);

        // 20 MB
        if (blob.size >= MAX_FILE_SIZE) {
            topToastMessage.enqueue({
                title: 'File Size Limit Exceeded (20 MB)',
                body: `The size of the file you submitted is ${convertToScale(blob.size)}.`,
            });
            return;
        }

        assert(id !== null);
        assert(category !== null);

        try {
            const result = await Api.create(oid, blob, { id, title, category }, remark);
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
                topToastMessage.enqueue({
                    title: 'Deferred Document',
                    body: `${id} is deferred.`,
                    type: ToastType.Offline,
                });
                dispatch(Events.Done);
                return;
            }
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

{#if $earliestBatch === null || typeof $earliestBatch === 'undefined'}
    <p>No available barcodes.</p>
{:else}
    {@const bytes = file?.size ?? 0}
    <form on:submit|preventDefault|stopPropagation={handleSubmit}>
        Barcode: <BarcodeSelect bind:code={id} barcodes={$earliestBatch.codes}></BarcodeSelect>
        {#if id !== null}
            <div><QrGenerator url="/track?id={id}" /></div>
        {/if}
        <TextInput bind:value={title} placeholder="Document Title..." name="title" label="Document Title:"></TextInput>
        Category: <CategorySelect bind:catId={category} categories={$categoryList.active} />
        <TextInput bind:value={remark} placeholder="Remarks..." name="remark" label="Remark:" required={false}></TextInput> 
        <input type="file" multiple={false} required bind:files={fileList} />
        {#if typeof file !== 'undefined'}
            {convertToScale(file.size)}
        {/if}
        <Button submit disabled={bytes >= MAX_FILE_SIZE}>
            <DocumentAdd alt="Create document" color={IconColor.White} />
            Create Document
        </Button>
    </form>
{/if}

<style>
    div {
        display: flex;
        justify-content: center;
    }
</style>
