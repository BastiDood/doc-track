<script lang="ts">
    import { assert } from "../../../../assert.ts";

    import { Snapshot } from "../../../../api/snapshot.ts";
    import { Snapshot as SnapshotModel, Status } from "~model/snapshot.ts";
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts'
    import { Office } from "~model/office.ts";
    import { allOffices } from "../../../../pages/dashboard/stores/OfficeStore.ts";

    import OfficeSelect from "../../OfficeSelect.svelte.ts";
    import Select from "../../Select.svelte";
    import TextInput from "../../TextInput.svelte.ts";
    
    let docId: SnapshotModel['doc'];
    let userOfficeId: Office['id']; 
    let setStatusTo: SnapshotModel['status'] | null = null;
    let destOfficeId: SnapshotModel['target'] | null = null;
    let statusIndex: number | null = null;

    let statusArr = [Status.Send, Status.Receive, Status.Terminate]
    $: {
        assert(statusIndex !== null);
        setStatusTo = statusArr[statusIndex] ?? null;
    }
    async function handleSubmit(this: HTMLFormElement) {
        const node = this.elements.namedItem('snap-remark');
        assert(node instanceof HTMLInputElement)
        assert(node.type === 'text');
        
        assert(destOfficeId !== null);
        assert(setStatusTo !== null);
        assert(userOfficeId !== null);
        assert(docId);

        try {
            Snapshot.insert( userOfficeId,{
                    doc: docId,
                    status: setStatusTo,
                    remark: node.value,
                    target: destOfficeId
                }
            )

            // TODO: Refresh the inbox store
            // TODO: Exit out of the modal.
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>
    You are currently adding a snapshot as {$userSession?.email}.
</p>

<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <TextInput
        required
        name="snap-docId"
        label="Document Barcode ID: "
    />
    Set Target Office:
    <OfficeSelect offices={$allOffices} bind:oid={destOfficeId}/>
    Set Status As:
    <Select options={statusArr} bind:index={statusIndex} />
    <TextInput
        name="snap-remark"
        label="Remarks: "
        placeholder="Optional"
    />

</form>



