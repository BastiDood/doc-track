<script lang="ts">
    import { checkPerms } from './util.ts';
    import { assert } from '../../../../assert.ts';
    import { IconColor, PersonPayload } from '../../../types.ts';
    import { Staff } from '../../../../api/staff.ts';
    import { Local } from '../../../../../../model/src/permission.ts';

    import { staffList } from '../../../../pages/dashboard/stores/StaffStore.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';

    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';

    export let payload: PersonPayload;

    async function handleSubmit(this: HTMLFormElement) {
        // Recompute permissions before submitting
        const nodes = this.elements.namedItem('perms');
        assert(nodes instanceof RadioNodeList);

        let permsVal = 0;
        nodes.forEach(node => {
            assert(node instanceof HTMLInputElement);
            assert(node.type === 'checkbox');
            if (node.checked) permsVal |= parseInt(node.value, 10);
        });

        // No point in handling no-changes.
        if (payload.permission === permsVal) return;

        try {
            // Rebuild pseudo-user object
            await Staff.setPermission({
                office: payload.office,
                user_id: payload.id,
                permission: permsVal,
            });

            // Reload the staffList store
            await staffList.reload?.();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>
<p>You are modifying {payload.email}'s permissions in {$allOffices[payload.office]}.</p>
<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.AddStaff}
            checked={checkPerms(payload.permission, Local.AddStaff)}
        />
        Add Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.RemoveStaff}
            checked={checkPerms(payload.permission, Local.RemoveStaff)}
        />
        Remove Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.UpdateStaff}
            checked={checkPerms(payload.permission, Local.UpdateStaff)}
        />
        Update Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.AddInvite}
            checked={checkPerms(payload.permission, Local.AddInvite)}
        />
        Add Invite
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.RevokeInvite}
            checked={checkPerms(payload.permission, Local.RevokeInvite)}
        />
        Revoke Invite
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewBatch}
            checked={checkPerms(payload.permission, Local.ViewBatch)}
        />
        View Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.GenerateBatch}
            checked={checkPerms(payload.permission, Local.GenerateBatch)}
        />
        Generate Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.InvalidateBatch}
            checked={checkPerms(payload.permission, Local.InvalidateBatch)}
        />
        Invalidate Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.CreateDocument}
            checked={checkPerms(payload.permission, Local.CreateDocument)}
        />
        Create Document
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.InsertSnapshot}
            checked={checkPerms(payload.permission, Local.InsertSnapshot)}
        />
        Insert Snapshot
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewMetrics}
            checked={checkPerms(payload.permission, Local.ViewMetrics)}
        />
        View Metrics
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewInbox}
            checked={checkPerms(payload.permission, Local.ViewInbox)}
        />
        View Inbox
    </label>
    <Button submit><Edit color={IconColor.White} alt="Modify Staff" /> Modify Staff</Button>
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
    }
</style>
