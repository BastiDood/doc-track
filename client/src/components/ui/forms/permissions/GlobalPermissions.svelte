<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { checkPerms } from './util.ts';
    import { assert } from '../../../../assert.ts';

    import { User as Api} from '../../../../api/user.ts';
    import { IconColor, Events } from '../../../types.ts';
    import { Global } from '../../../../../../model/src/permission.ts';
    import { User } from '~model/user.ts';

    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';

    import { topToastMessage } from '../../../../pages/dashboard/stores/ToastStore.ts';
    import { userList } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { Staff } from '~model/staff.ts';

    export let id: Staff['user_id'];
    export let permission: User['permission'];

    const dispatch = createEventDispatcher()

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
                id: id,
                permission: permsVal,
            });
            await userList.reload?.();
            dispatch(Events.Done);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

<form on:submit|preventDefault|stopPropagation={handleSubmit}>
    <p>User ID: {id}</p>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.GetOffices}
            checked={checkPerms(permission, Global.GetOffices)}
        />
        Get Offices
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateOffice}
            checked={checkPerms(permission, Global.CreateOffice)}
        />
        Create Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateOffice}
            checked={checkPerms(permission, Global.UpdateOffice)}
        />
        Update Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateUser}
            checked={checkPerms(permission, Global.UpdateUser)}
        />
        Update User
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateCategory}
            checked={checkPerms(permission, Global.CreateCategory)}
        />
        Create Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateCategory}
            checked={checkPerms(permission, Global.UpdateCategory)}
        />
        Update Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.DeleteCategory}
            checked={checkPerms(permission, Global.DeleteCategory)}
        />
        Delete Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ActivateCategory}
            checked={checkPerms(permission, Global.ActivateCategory)}
        />
        Activate Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ViewMetrics}
            checked={checkPerms(permission, Global.ViewMetrics)}
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
