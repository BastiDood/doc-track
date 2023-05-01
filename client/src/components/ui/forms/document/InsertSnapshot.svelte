<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { Snapshot } from '../../../../api/snapshot.ts';
    import { Snapshot as SnapshotModel, Status } from '../../../../../../model/src/snapshot.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { Office } from '../../../../../../model/src/office.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';
    import { documentInbox, documentOutbox } from '../../../../pages/dashboard/stores/DocumentStore.ts';
    import { reloadMetrics } from '../../../../pages/dashboard/stores/MetricStore.ts';
    import { ContextPayload, IconColor } from '../../../types.ts';

    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';
    import StatusSelect from '../../StatusSelect.svelte';
    import TextInput from '../../TextInput.svelte';
    
    export let payload: ContextPayload;
    export let userOfficeId: Office['id'];
    export let status: Status;

    let destOfficeId: SnapshotModel['target'] | null = null;

    async function handleSubmit(this: HTMLFormElement) {
        const node = this.elements.namedItem('snap-remark');
        assert(node instanceof HTMLInputElement);
        assert(node.type === 'text');
    
        if (status === Status.Receive) destOfficeId = userOfficeId;
        if (status === Status.Terminate) destOfficeId = null;
        else assert(destOfficeId !== null);
        assert(payload.id);

        try {
            await Snapshot.insert(userOfficeId,{
                doc: payload.id,
                status,
                remark: node.value,
                target: destOfficeId,
            });
            await documentInbox.reload?.();
            await documentOutbox.reload?.();
            await reloadMetrics();
            // TODO: Exit out of the modal.
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently adding a snapshot as {$userSession?.email} in office {userOfficeId}.</p>
<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    Document Barcode ID: {payload.id}
    <br />
    {#if status === Status.Terminate || status === Status.Receive}
        Set Target Office: This Office.
    {:else}
        Set Target Office: <OfficeSelect offices={$allOffices} bind:oid={destOfficeId} />
    {/if}
    
    <br />
    Set Status As: <StatusSelect bind:value={status} />
    <br />
    <TextInput name="snap-remark" label="Remarks: " placeholder="Optional" />
    <Button submit> <Checkmark color={IconColor.White} alt="Submit this Document" /> Submit this Document</Button>
</form>
