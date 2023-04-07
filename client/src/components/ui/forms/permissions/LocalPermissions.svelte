<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { Staff } from '../../../../api/staff.ts';
    import type { User as UserModel } from '../../../../../../model/src/user.ts';
    import { Local } from '../../../../../../model/src/permission.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';

    export let user: UserModel;
    export let officeNo: number;
    let permission: UserModel['permission']; // Pass permission here as local permission
    
    $: permission = user.permission;

    async function handleSubmit(this: HTMLFormElement) { 
        // Recompute permissions before submitting
        const nodes = this.elements.namedItem('perms');
        assert(nodes instanceof RadioNodeList);

        let permsVal = 0;
        for (const node of nodes) {
            assert(node instanceof HTMLInputElement);
            assert(node.type === 'checkbox');
            if (node.checked) permsVal |= parseInt(node.value, 10);
        }

        // No point in handling no-changes.
        if (permission === permsVal) return;
 
        try {
            // Rebuild pseudo-user object
            await Staff.setPermission({
                office: officeNo,
                user_id: user.id, 
                permission: permsVal,
            });

            // Might be editing own session, might be not, reload anyway
            await userSession.reload?.();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p> You are currently editing the user {user.name}: {user.email} on office {officeNo}</p>
<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.AddStaff}
            checked={(permission & Local.AddStaff) === Local.AddStaff}
        />
        Add Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.RemoveStaff}
            checked={(permission & Local.RemoveStaff) === Local.RemoveStaff}
        />
        Remove Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.UpdateStaff}
            checked={(permission & Local.UpdateStaff) === Local.UpdateStaff}
        />
        Update Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.AddInvite}
            checked={(permission & Local.AddInvite) === Local.AddInvite}
        />
        Add Invite
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.RevokeInvite}
            checked={(permission & Local.RevokeInvite) === Local.RevokeInvite}
        />
        Revoke Invite
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewBatch}
            checked={(permission & Local.ViewBatch) === Local.ViewBatch}
        />
        View Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.GenerateBatch}
            checked={(permission & Local.GenerateBatch) === Local.GenerateBatch}
        />
        Generate Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.InvalidateBatch}
            checked={(permission & Local.InvalidateBatch) === Local.InvalidateBatch}
        />
        Invalidate Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.CreateDocument}
            checked={(permission & Local.CreateDocument) === Local.CreateDocument}
        />
        Create Document
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.InsertSnapshot}
            checked={(permission & Local.InsertSnapshot) === Local.InsertSnapshot}
        />
        Insert Snapshot
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewMetrics}
            checked={(permission & Local.ViewMetrics) === Local.ViewMetrics}
        />
        View Metrics
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewInbox}
            checked={(permission & Local.ViewInbox) === Local.ViewInbox}
        />
        View Inbox
    </label>
    <Button submit><Edit alt="Modify Staff" /> Modify Staff</Button>
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
    }
</style>
