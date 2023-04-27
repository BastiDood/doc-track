<script lang='ts'>
    import { assert } from '../../../../assert.ts';
    import { Office as OfficeModel } from '../../../../../../model/src/office.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';
    import { Invite } from '../../../../api/invite.ts';

    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';

    let curEmail = '';
    let currId: OfficeModel['id'] | null = null;
    let currName: OfficeModel['name'] | null = null;

    // eslint-disable-next-line no-extra-parens
    $: currName = currId === null ? null : $allOffices[currId] ?? null;

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

        // Email validation
        const emailInput = this.elements.namedItem('email');
        assert(emailInput instanceof HTMLInputElement);
        assert(emailInput.type === 'text');

        // Checks validity of office
        if (currId === null || typeof currName !== 'string') return;
        if (!this.reportValidity()) return;
        if (emailInput.value === currName) return;

        try {
            await Invite.add({
                email: curEmail,
                office: currId,
                permission: permsVal,
            });

            // eslint-disable-next-line require-atomic-updates
            currId = null;
            // eslint-disable-next-line require-atomic-updates
            currName = null;

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
            <p>Office ID: {currId}</p>
            {#if currName !== null}
                <Button submit><Checkmark alt='Revoke invite'/>Revoke Invite</Button> 
            {/if}
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
