<script lang="ts">
    import { assert } from '../../../assert.ts';

    import { User } from '../../../api/user.ts';
    import { Global } from '../../../../../model/src/permission.ts';
    import { userSession } from '../../../pages/dashboard/stores/UserStore.ts';

    import Button from '../Button.svelte';
    import Edit from '../../icons/Edit.svelte';

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
        if ($userSession.permission === permsVal) return;
 
        try {
            // Rebuild pseudo-user object
            await User.setPermission({
                id: $userSession.id,
                permission: permsVal,
            });
            await userSession.reload?.();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }

</script>

<h2>{$userSession.name}</h2>
<p>{$userSession.email}: {$userSession.id}</p>
<p>current(server side): {$userSession.permission}</p>
<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.GetOffices}
            checked={($userSession.permission & Global.GetOffices) === Global.GetOffices}
        />
        Get Offices
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateOffice}
            checked={($userSession.permission & Global.CreateOffice) === Global.CreateOffice}
        />
        Create Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateOffice}
            checked={($userSession.permission & Global.UpdateOffice) === Global.UpdateOffice}
        />
        Update Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateUser}
            checked={($userSession.permission & Global.UpdateUser) === Global.UpdateUser}
        />
        Update User
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateCategory}
            checked={($userSession.permission & Global.CreateCategory) === Global.CreateCategory}
        />
        Create Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateCategory}
            checked={($userSession.permission & Global.UpdateCategory) === Global.UpdateCategory}
        />
        Update Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.DeleteCategory}
            checked={($userSession.permission & Global.DeleteCategory) === Global.DeleteCategory}
        />
        Delete Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ActivateCategory}
            checked={($userSession.permission & Global.ActivateCategory) === Global.ActivateCategory}
        />
        Activate Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ViewMetrics}
            checked={($userSession.permission & Global.ViewMetrics) === Global.ViewMetrics}
        />
        View Metrics
    </label>
    <Button submit={true}><Edit alt="Modify Staff" /> Modify Staff</Button>
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
    }
</style>
