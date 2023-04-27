<script lang='ts'>
    import { assert } from '../../../../assert.ts';
    import { Invite } from '../../../../api/invite.ts';
    import { Office as OfficeModel } from '../../../../../../model/src/office.ts';
    import { Global } from '../../../../../../model/src/permission.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';

    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';

    let currEmail = '';
    let currId: OfficeModel['id'] | null = null;

    async function handleSubmit(this: HTMLFormElement) {
        // Computes permissions
        let permsVal = 0;
        const permissionSelect = this.elements.namedItem('perms');
        assert(permissionSelect instanceof RadioNodeList);
        permissionSelect.forEach(perm => {
            assert(perm instanceof HTMLInputElement);
            assert(perm.type === 'checkbox');
            if (perm.checked) permsVal += parseInt(perm.value, 10);
        });

        // Checks validity of office
        if (currId === null) return;
        if (!this.reportValidity()) return;

        try {
            await Invite.add({
                email: currEmail,
                office: currId,
                permission: permsVal,
            });
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently inviting a user as {$userSession?.email}</p>
<article>
    {#if Object.getOwnPropertyNames($allOffices).length === 0}
        Invite unavailable as there are no offices available.
    {:else}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>   
            <OfficeSelect bind:oid={currId} offices={$allOffices} />
            <br />
            <label>
                Email
                <input required type="email" name="inputemail" placeholder="example@up.edu.ph" bind:value={currEmail} />
            </label>
            <br>
            <p><b>Permissions:</b></p>
            <label>
                <input required type="checkbox" name="perms" value={Global.GetOffices} />
                Get Office
            </label>
            <br />
            <label>
                <input required type="checkbox" name="perms" value={Global.CreateOffice} />
                Create Office
            </label>
            <br />
            <label>
                <input required type="checkbox" name="perms" value={Global.UpdateOffice} />
                Update Office
            </label>
            <br />
            <label>
                <input required type="checkbox" name="perms" value={Global.UpdateUser} />
                Update User
            </label>
            <br />
            <label>
                <input required type="checkbox" name="perms" value={Global.CreateCategory} />
                Create Category
            </label>
            <br />
            <label>
                <input required type="checkbox" name="perms" value={Global.UpdateCategory} />
                Update Category
            </label>
            <br />
            <label>
                <input required type="checkbox" name="perms" value={Global.DeleteCategory} />
                Delete Category
            </label>
            <br />
            <label>
                <input required type="checkbox" name="perms" value={Global.ActivateCategory} />
                Activate Category
            </label>
            <br />
            <label>
                <input required type="checkbox" name="perms" value={Global.ViewMetrics} />
                View Metrics
            </label>
            <br />
            <Button submit><Checkmark alt="Invite User" />Invite User</Button> 
        </form>
    {/if}
</article>

<style>
    @import url('../../../../pages/vars.css');

    input {
        border: var(--primary-color) 2px solid;
        border-radius: var(--border-radius);
        padding: var(--spacing-small) var(--spacing-normal);
    }
</style>
