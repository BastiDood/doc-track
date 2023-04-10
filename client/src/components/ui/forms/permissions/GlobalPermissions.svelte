<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { User } from '../../../../api/user.ts';
    import type { User as UserModel } from '../../../../../../model/src/user.ts';
    import { Global } from '../../../../../../model/src/permission.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';

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
            checked={(user.permission & Global.GetOffices) === Global.GetOffices}
        />
        Get Offices
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateOffice}
            checked={(user.permission & Global.CreateOffice) === Global.CreateOffice}
        />
        Create Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateOffice}
            checked={(user.permission & Global.UpdateOffice) === Global.UpdateOffice}
        />
        Update Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateUser}
            checked={(user.permission & Global.UpdateUser) === Global.UpdateUser}
        />
        Update User
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateCategory}
            checked={(user.permission & Global.CreateCategory) === Global.CreateCategory}
        />
        Create Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateCategory}
            checked={(user.permission & Global.UpdateCategory) === Global.UpdateCategory}
        />
        Update Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.DeleteCategory}
            checked={(user.permission & Global.DeleteCategory) === Global.DeleteCategory}
        />
        Delete Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ActivateCategory}
            checked={(user.permission & Global.ActivateCategory) === Global.ActivateCategory}
        />
        Activate Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ViewMetrics}
            checked={(user.permission & Global.ViewMetrics) === Global.ViewMetrics}
        />
        View Metrics
    </label>
    <Button submit><Edit alt="Modify Staff" /> Modify Staff</Button>
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
    }
</style>
