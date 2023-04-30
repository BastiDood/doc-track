<script lang="ts">
    import { checkPerms } from './util.ts';
    import { assert } from '../../../../assert.ts';
    import { IconColor } from '../../../types.ts';
    import { Staff } from '../../../../api/staff.ts';

    import { Local } from '../../../../../../model/src/permission.ts';
    import type { User as UserModel } from '../../../../../../model/src/user.ts';

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
        nodes.forEach(node => {
            assert(node instanceof HTMLInputElement);
            assert(node.type === 'checkbox');
            if (node.checked) permsVal |= parseInt(node.value, 10);
        });

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
<p>You are modifying {user.email}'s permissions in Office ID {office}.</p>
<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.AddStaff}
            checked={checkPerms(user.permission, Local.AddStaff)}
        />
        Add Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.RemoveStaff}
            checked={checkPerms(user.permission, Local.RemoveStaff)}
        />
        Remove Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.UpdateStaff}
            checked={checkPerms(user.permission, Local.UpdateStaff)}
        />
        Update Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.AddInvite}
            checked={checkPerms(user.permission, Local.AddInvite)}
        />
        Add Invite
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.RevokeInvite}
            checked={checkPerms(user.permission, Local.RevokeInvite)}
        />
        Revoke Invite
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewBatch}
            checked={checkPerms(user.permission, Local.ViewBatch)}
        />
        View Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.GenerateBatch}
            checked={checkPerms(user.permission, Local.GenerateBatch)}
        />
        Generate Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.InvalidateBatch}
            checked={checkPerms(user.permission, Local.InvalidateBatch)}
        />
        Invalidate Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.CreateDocument}
            checked={checkPerms(user.permission, Local.CreateDocument)}
        />
        Create Document
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.InsertSnapshot}
            checked={checkPerms(user.permission, Local.InsertSnapshot)}
        />
        Insert Snapshot
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewMetrics}
            checked={checkPerms(user.permission, Local.ViewMetrics)}
        />
        View Metrics
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewInbox}
            checked={checkPerms(user.permission, Local.ViewInbox)}
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
