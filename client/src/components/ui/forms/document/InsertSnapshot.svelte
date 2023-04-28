<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { Snapshot } from '../../../../api/snapshot.ts';
    import { Snapshot as SnapshotModel, Status } from '../../../../../../model/src/snapshot.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { Office } from '../../../../../../model/src/office.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';
    import { ContextPayload, IconColor } from '../../../types.ts';

    import OfficeSelect from '../../OfficeSelect.svelte';
    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    
    export let payload: ContextPayload;
    export let userOfficeId: Office['id'];
    export let status: Status | undefined;
    let docId: SnapshotModel['doc'] = payload.id;

    let destOfficeId: SnapshotModel['target'] | null = null;
    

    async function handleSubmit(this: HTMLFormElement) {
        const node = this.elements.namedItem('snap-remark');
        assert(node instanceof HTMLInputElement);
        assert(node.type === 'text');
    
        assert(typeof status !== 'undefined');
        assert(destOfficeId !== null);
        assert(userOfficeId !== null);
        assert(docId);

        try {
            await Snapshot.insert( userOfficeId,{
                doc: docId,
                status,
                remark: node.value,
                target: destOfficeId,
            });

            // TODO: Refresh the inbox store
            // TODO: Exit out of the modal.
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>
    You are currently adding a snapshot as {$userSession?.email} in office {userOfficeId}.
</p>

<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <TextInput
        required
        name="snap-docId"
        label="Document Barcode ID: "
        bind:value={docId}
    />
    <br>
    Set Target Office:
    <OfficeSelect offices={$allOffices} bind:oid={destOfficeId}/>
    <br>
    Set Status As:
    <select required bind:value={status}>
        <option value={Status.Send}>Send</option>
        <option value={Status.Receive}>Receive</option>
        <option value={Status.Terminate}>Terminate</option>
    </select>
    <br>
    <TextInput
        name="snap-remark"
        label="Remarks: "
        placeholder="Optional"
    />
    <Button submit> <Checkmark color={IconColor.White} alt="Submit this Document" /> Submit this Document</Button>
</form>
