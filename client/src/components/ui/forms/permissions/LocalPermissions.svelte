<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { checkAllPerms } from './util.ts';
    import { assert } from '../../../../assert.ts';
    import { Events, IconColor, ToastType } from '../../../types.ts';
    import { Staff as Api } from '../../../../api/staff.ts';
    import { Staff } from '~model/staff.ts';
    import { User } from '~model/user.ts';
    import { Local } from '../../../../../../model/src/permission.ts';

    import { staffList } from '../../../../stores/StaffStore.ts';
    import { allOffices } from '../../../../stores/OfficeStore.ts';
    import { topToastMessage } from '../../../../stores/ToastStore.ts';
    import { userSession } from '../../../../stores/UserStore.ts';

    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';

    export let officeId: Staff['office'];
    export let permission: Staff['permission'];
    export let userId: Staff['user_id'];
    export let email: User['email'];

    const dispatch = createEventDispatcher();

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
        if (permission === permsVal) {
            dispatch(Events.Done);
            return;
        }

        try {
            // Rebuild pseudo-user object
            await Api.setPermission({
                office: officeId,
                user_id: userId,
                permission: permsVal,
            });

            // Reload the staffList store
            await staffList.reload?.();
            await userSession.reload?.();
            topToastMessage.enqueue({
                type: ToastType.Success,
                title: 'Local Permission',
                body: 'You have successfully edited a staff\'s local permission.',
            });
            dispatch(Events.Done);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

<p>You are modifying {email}'s permissions in {$allOffices[officeId]}.</p>
<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.AddStaff}
            checked={checkAllPerms(permission, Local.AddStaff)}
        />
        Add Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.RemoveStaff}
            checked={checkAllPerms(permission, Local.RemoveStaff)}
        />
        Remove Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.UpdateStaff}
            checked={checkAllPerms(permission, Local.UpdateStaff)}
        />
        Update Staff
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.AddInvite}
            checked={checkAllPerms(permission, Local.AddInvite)}
        />
        Add Invite
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.RevokeInvite}
            checked={checkAllPerms(permission, Local.RevokeInvite)}
        />
        Revoke Invite
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewBatch}
            checked={checkAllPerms(permission, Local.ViewBatch)}
        />
        View Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.GenerateBatch}
            checked={checkAllPerms(permission, Local.GenerateBatch)}
        />
        Generate Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.InvalidateBatch}
            checked={checkAllPerms(permission, Local.InvalidateBatch)}
        />
        Invalidate Batch
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.CreateDocument}
            checked={checkAllPerms(permission, Local.CreateDocument)}
        />
        Create Document
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.InsertSnapshot}
            checked={checkAllPerms(permission, Local.InsertSnapshot)}
        />
        Insert Snapshot
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewMetrics}
            checked={checkAllPerms(permission, Local.ViewMetrics)}
        />
        View Metrics
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Local.ViewInbox}
            checked={checkAllPerms(permission, Local.ViewInbox)}
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
