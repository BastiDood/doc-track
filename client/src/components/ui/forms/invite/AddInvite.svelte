<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import { assert } from '../../../../assert.ts';
    import { Invite } from '../../../../api/invite.ts';
    import { Global } from '../../../../../../model/src/permission.ts';
    import { Events, ToastType } from '../../../types.ts';

    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';

    import { dashboardState } from '../../../../pages/dashboard/stores/DashboardState.ts';
    import { inviteList } from '../../../../pages/dashboard/stores/InviteStore.ts';
    import { topToastMessage } from '../../../../pages/dashboard/stores/ToastStore.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';

    let email = '';

    const dispatch = createEventDispatcher();
    async function handleSubmit(this: HTMLFormElement) {
        // Computes permissions
        let permission = 0;
        const permissionSelect = this.elements.namedItem('perms');
        assert(permissionSelect instanceof RadioNodeList);
        permissionSelect.forEach(perm => {
            assert(perm instanceof HTMLInputElement);
            assert(perm.type === 'checkbox');
            if (perm.checked) permission += parseInt(perm.value, 10);
        });

        const office = $dashboardState.currentOffice;
        assert(office !== null);

        // Checks validity of office
        if (!this.reportValidity()) return;

        try {
            await Invite.add({ email, office, permission });
            await inviteList.reload?.();
            topToastMessage.enqueue({ title: 'Invite Creation', body: 'You have successfully invited a new staff.', type: ToastType.Success });
            this.reset();
            dispatch(Events.Done);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

<p>You are currently inviting a user as {$userSession?.email}</p>
<article>
    <form on:submit|preventDefault|stopPropagation={handleSubmit}>   
        <br />
        <label>
            Email
            <input type="email" name="inputemail" placeholder="example@up.edu.ph" bind:value={email} />
        </label>
        <br />
        <p><b>Permissions:</b></p>
        <label>
            <input type="checkbox" name="perms" value={Global.CreateOffice} />
            Create Office
        </label>
        <br />
        <label>
            <input type="checkbox" name="perms" value={Global.UpdateOffice} />
            Update Office
        </label>
        <br />
        <label>
            <input type="checkbox" name="perms" value={Global.UpdateUser} />
            Update User
        </label>
        <br />
        <label>
            <input type="checkbox" name="perms" value={Global.CreateCategory} />
            Create Category
        </label>
        <br />
        <label>
            <input type="checkbox" name="perms" value={Global.UpdateCategory} />
            Update Category
        </label>
        <br />
        <label>
            <input type="checkbox" name="perms" value={Global.DeleteCategory} />
            Delete Category
        </label>
        <br />
        <label>
            <input type="checkbox" name="perms" value={Global.ActivateCategory} />
            Activate Category
        </label>
        <br />
        <label>
            <input type="checkbox" name="perms" value={Global.ViewMetrics} />
            View Metrics
        </label>
        <br />
        <Button submit><Checkmark alt="Invite User" />Invite User</Button> 
    </form>
</article>

<style>
    @import url('../../../../pages/vars.css');

    input {
        border: var(--primary-color) 2px solid;
        border-radius: var(--border-radius);
        padding: var(--spacing-small) var(--spacing-normal);
    }
</style>
