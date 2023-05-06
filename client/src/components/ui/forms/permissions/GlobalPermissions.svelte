<script lang="ts">
    import { checkPerms } from './util.ts';
    import { assert } from '../../../../assert.ts';

    import { User } from '../../../../api/user.ts';
    import { PersonPayload } from '../../../types.ts';
    import { Global } from '../../../../../../model/src/permission.ts';
    import { IconColor } from '../../../types.ts';

    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';
    import { userList } from '../../../../pages/dashboard/stores/UserStore.ts';

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
            await User.setPermission({
                id: payload.id,
                permission: permsVal,
            });
            await userList.reload?.();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <p>User ID: {payload.id}</p>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.GetOffices}
            checked={checkPerms(payload.permission, Global.GetOffices)}
        />
        Get Offices
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateOffice}
            checked={checkPerms(payload.permission, Global.CreateOffice)}
        />
        Create Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateOffice}
            checked={checkPerms(payload.permission, Global.UpdateOffice)}
        />
        Update Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateUser}
            checked={checkPerms(payload.permission, Global.UpdateUser)}
        />
        Update User
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateCategory}
            checked={checkPerms(payload.permission, Global.CreateCategory)}
        />
        Create Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateCategory}
            checked={checkPerms(payload.permission, Global.UpdateCategory)}
        />
        Update Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.DeleteCategory}
            checked={checkPerms(payload.permission, Global.DeleteCategory)}
        />
        Delete Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ActivateCategory}
            checked={checkPerms(payload.permission, Global.ActivateCategory)}
        />
        Activate Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ViewMetrics}
            checked={checkPerms(payload.permission, Global.ViewMetrics)}
        />
        View Metrics
    </label>
    <Button submit><Edit color={IconColor.White} alt="Modify Staff" /> Modify Staff</Button>
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
    }
</style>
