<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { User } from '../../../../api/user.ts';
    import { Global } from '../../../../../../model/src/permission.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';

    export let userId = $userSession.id;

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
                id: userId,
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
<p>current(server side): {$userSession.global_perms}</p>
<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <TextInput
        placeholder="Input user ID here."
        name="userId"
        label="User ID:"
        disabled={true}
        bind:value={userId}
    />
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.GetOffices}
            checked={($userSession.global_perms & Global.GetOffices) === Global.GetOffices}
        />
        Get Offices
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateOffice}
            checked={($userSession.global_perms & Global.CreateOffice) === Global.CreateOffice}
        />
        Create Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateOffice}
            checked={($userSession.global_perms & Global.UpdateOffice) === Global.UpdateOffice}
        />
        Update Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateUser}
            checked={($userSession.global_perms & Global.UpdateUser) === Global.UpdateUser}
        />
        Update User
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateCategory}
            checked={($userSession.global_perms & Global.CreateCategory) === Global.CreateCategory}
        />
        Create Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateCategory}
            checked={($userSession.global_perms & Global.UpdateCategory) === Global.UpdateCategory}
        />
        Update Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.DeleteCategory}
            checked={($userSession.global_perms & Global.DeleteCategory) === Global.DeleteCategory}
        />
        Delete Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ActivateCategory}
            checked={($userSession.global_perms & Global.ActivateCategory) === Global.ActivateCategory}
        />
        Activate Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ViewMetrics}
            checked={($userSession.global_perms & Global.ViewMetrics) === Global.ViewMetrics}
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
