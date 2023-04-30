<script lang="ts">
    import { checkPerms } from './util.ts';
    import { assert } from '../../../../assert.ts';

    import { User } from '../../../../api/user.ts';
    import type { User as UserModel } from '../../../../../../model/src/user.ts';
    import { Global } from '../../../../../../model/src/permission.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { IconColor } from '../../../types.ts';

    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';

    export let user: UserModel;

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
            await User.setPermission({
                id: user.id,
                permission: permsVal,
            });
            await userSession.reload?.();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <p>User ID: {user.id}</p>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.GetOffices}
            checked={checkPerms(user.permission, Global.GetOffices)}
        />
        Get Offices
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateOffice}
            checked={checkPerms(user.permission, Global.CreateOffice)}
        />
        Create Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateOffice}
            checked={checkPerms(user.permission, Global.UpdateOffice)}
        />
        Update Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateUser}
            checked={checkPerms(user.permission, Global.UpdateUser)}
        />
        Update User
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateCategory}
            checked={checkPerms(user.permission, Global.CreateCategory)}
        />
        Create Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateCategory}
            checked={checkPerms(user.permission, Global.UpdateCategory)}
        />
        Update Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.DeleteCategory}
            checked={checkPerms(user.permission, Global.DeleteCategory)}
        />
        Delete Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ActivateCategory}
            checked={checkPerms(user.permission, Global.ActivateCategory)}
        />
        Activate Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ViewMetrics}
            checked={checkPerms(user.permission, Global.ViewMetrics)}
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
