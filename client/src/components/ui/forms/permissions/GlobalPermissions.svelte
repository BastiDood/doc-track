<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { checkIfAllPerms } from './util.ts';
    import { assert } from '../../../../assert.ts';

    import { topToastMessage } from '../../../../stores/ToastStore.ts';
    import { userList, userSession } from '../../../../stores/UserStore.ts';

    import { User as Api } from '../../../../api/user.ts';
    import { IconColor, Events, ToastType } from '../../../types.ts';
    import { Global } from '../../../../../../model/src/permission.ts';
    import { User } from '~model/user.ts';
    import { Staff } from '~model/staff.ts';

    import Button from '../../Button.svelte';
    import Edit from '../../../icons/Edit.svelte';
    

    export let id: Staff['user_id'];
    export let permission: User['permission'];

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
                id: id,
                permission: permsVal,
            });
            await userList.reload?.();
            await userSession.reload?.();
            topToastMessage.enqueue({
                type: ToastType.Success,
                title: 'Global Permission',
                body: 'You have successfully edited a user\'s global permission.',
            });
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
            value={Global.CreateOffice}
            checked={checkIfAllPerms(permission, Global.CreateOffice)}
        />
        Create Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateOffice}
            checked={checkIfAllPerms(permission, Global.UpdateOffice)}
        />
        Update Office
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateUser}
            checked={checkIfAllPerms(permission, Global.UpdateUser)}
        />
        Update User
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.CreateCategory}
            checked={checkIfAllPerms(permission, Global.CreateCategory)}
        />
        Create Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.UpdateCategory}
            checked={checkIfAllPerms(permission, Global.UpdateCategory)}
        />
        Update Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.DeleteCategory}
            checked={checkIfAllPerms(permission, Global.DeleteCategory)}
        />
        Delete Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ActivateCategory}
            checked={checkIfAllPerms(permission, Global.ActivateCategory)}
        />
        Activate Category
    </label>
    <label>
        <input
            type="checkbox"
            name="perms"
            value={Global.ViewMetrics}
            checked={checkIfAllPerms(permission, Global.ViewMetrics)}
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
