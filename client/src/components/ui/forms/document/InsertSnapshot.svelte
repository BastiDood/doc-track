<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { assert } from '../../../../assert.ts';

    import { Snapshot } from '../../../../api/snapshot.ts';
    import { Snapshot as SnapshotModel, Status } from '../../../../../../model/src/snapshot.ts';
    import { IconColor, Events, ToastType } from '../../../types.ts';
    import { Document } from '~model/document.ts';
    import { Office } from '~model/office.ts';

    import { documentInbox, documentOutbox } from '../../../../stores/DocumentStore.ts';
    import { allOffices } from '../../../../stores/OfficeStore.ts';
    import { topToastMessage } from '../../../../stores/ToastStore.ts';
    import { userSession } from '../../../../stores/UserStore.ts';
    import { reloadMetrics } from '../../../../stores/MetricStore.ts';
    import { deferredSnaps } from '../../../../stores/DeferredStore.ts';
    
    import { DeferredSnap } from '../../../../api/error.ts';

    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';
    import StatusSelect from '../../StatusSelect.svelte';
    import TextInput from '../../TextInput.svelte';

    export let docId: Document['id'];
    export let userOfficeId: Office['id'];
    export let status: Status;

    const dispatch = createEventDispatcher();
    let destOfficeId: SnapshotModel['target'] | null = null;

    async function handleSubmit(this: HTMLFormElement) {
        const node = this.elements.namedItem('snap-remark');
        assert(node instanceof HTMLInputElement);
        assert(node.type === 'text');
        assert(docId);

        switch (status) {
            case Status.Register:
            case Status.Receive:
                destOfficeId = userOfficeId;
                break;
            case Status.Terminate:
                destOfficeId = null;
                break;
            default:
                assert(destOfficeId !== null);
        }
    
        try {
            await Snapshot.insert(userOfficeId, {
                doc: docId,
                status,
                remark: node.value,
                target: destOfficeId,
            });

            switch (status) {
                case Status.Register:
                    topToastMessage.enqueue({
                        title: 'Document Received',
                        body: 'You have successfully received a document.',
                        type: ToastType.Success,
                    });
                    break;
                case Status.Send:
                    topToastMessage.enqueue({
                        type: ToastType.Success,
                        title: 'Document Sent',
                        body: 'You have successfully sent a document.',
                    });
                    break;
                case Status.Receive:
                    topToastMessage.enqueue({
                        type: ToastType.Success,
                        title: 'Document Received',
                        body: 'You have successfully received a document.',
                    });
                    break;
                case Status.Terminate:
                    topToastMessage.enqueue({
                        type: ToastType.Success,
                        title: 'Document Terminated',
                        body: 'You have successfully terminated a document.',
                    });
                    break;
                default:
                    throw new Error('unexpected status type');
            }
            await documentInbox.reload?.();
            await documentOutbox.reload?.();
            await reloadMetrics();
            dispatch(Events.Done);
        } catch (err) {
            if (err instanceof DeferredSnap) {
                await deferredSnaps.upsert({ status, doc: docId });
                topToastMessage.enqueue({
                    title: err.name,
                    body: `${docId} is deferred.`,
                    type: ToastType.Offline,
                });
                dispatch(Events.Done);
                return;
            }
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

<p>You are currently adding a snapshot as {$userSession?.email} in office {userOfficeId}.</p>
<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <p>Document Barcode ID: {docId}</p>
    <br />
    {#if status === Status.Terminate || status === Status.Receive}
        <p>Set Target Office: This Office.</p>
    {:else}
        <p>Set Target Office: <OfficeSelect offices={$allOffices} bind:oid={destOfficeId} /></p>
    {/if}
    
    <br />
    <p>Set Status As: <StatusSelect disabled bind:value={status} /></p>
    <br />
    <TextInput name="snap-remark" label="Remarks: " placeholder="Optional" />
    <Button submit> <Checkmark color={IconColor.White} alt="Submit this Document" /> Submit this Document</Button>
</form>
