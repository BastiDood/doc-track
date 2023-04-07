<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { Staff } from '../../../../api/staff.ts';
    import type { User as UserModel } from '../../../../../../model/src/user.ts';
    import { Local } from '../../../../../../model/src/permission.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';

    export let user: UserModel;
    export let office: number;

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
        if (user.permission === permsVal) return;
 
        try {
            // Rebuild pseudo-user object
            await Staff.setPermission({
                office,
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

<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.AddStaff}
            checked={(user.permission & Local.AddStaff) === Local.AddStaff}
        />
        Add Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.RemoveStaff}
            checked={(user.permission & Local.RemoveStaff) === Local.RemoveStaff}
        />
        Remove Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.UpdateStaff}
            checked={(user.permission & Local.UpdateStaff) === Local.UpdateStaff}
        />
        Update Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.AddInvite}
            checked={(user.permission & Local.AddInvite) === Local.AddInvite}
        />
        Add Invite
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.RevokeInvite}
            checked={(user.permission & Local.RevokeInvite) === Local.RevokeInvite}
        />
        Revoke Invite
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewBatch}
            checked={(user.permission & Local.ViewBatch) === Local.ViewBatch}
        />
        View Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.GenerateBatch}
            checked={(user.permission & Local.GenerateBatch) === Local.GenerateBatch}
        />
        Generate Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.InvalidateBatch}
            checked={(user.permission & Local.InvalidateBatch) === Local.InvalidateBatch}
        />
        Invalidate Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.CreateDocument}
            checked={(user.permission & Local.CreateDocument) === Local.CreateDocument}
        />
        Create Document
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.InsertSnapshot}
            checked={(user.permission & Local.InsertSnapshot) === Local.InsertSnapshot}
        />
        Insert Snapshot
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewMetrics}
            checked={(user.permission & Local.ViewMetrics) === Local.ViewMetrics}
        />
        View Metrics
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewInbox}
            checked={(user.permission & Local.ViewInbox) === Local.ViewInbox}
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
