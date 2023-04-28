<script lang='ts'>
    import { assert } from '../../../../assert.ts';
    import { Invite } from '../../../../api/invite.ts';

    import type { Office as OfficeModel } from '../../../../../../model/src/office.ts';
    import type { User } from '../../../../../../model/src/user.ts';

    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';

    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import InviteSelect from '../../InviteSelect.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';

    let currOid: OfficeModel['id'] | null = null;
    let currEmail: User['email'] | undefined;

    async function handleSubmit(this: HTMLFormElement) {
        // Email validation
        const emailInput = this.elements.namedItem('inputemail');
        assert(emailInput instanceof HTMLInputElement);
        assert(emailInput.type === 'email');

        // Checks validity of office
        if (currOid === null || typeof currEmail === 'undefined') return;
        if (!this.reportValidity()) return;

        try {
            await Invite.revoke({ office: currOid, email: currEmail });
            document.getElementById(`invite-${currEmail}`)?.remove();
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently revoking invites as {$userSession?.email}</p>
<article>
    {#if Object.getOwnPropertyNames($allOffices).length === 0}
        Invite unavailable as there are no offices available.
    {:else}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>   
            <OfficeSelect bind:oid={currOid} offices={$allOffices} />
            {#if currOid !== null}
                <br />
                <!-- TODO: We probably want to put this in a dedicated cache/store. -->
                {#await Invite.getList(currOid)}
                    <span>Loading invites...</span>
                {:then invites}
                    <InviteSelect {invites} bind:value={currEmail} />
                {/await}
                <br />
                <p>Current deleting: <input type="email" name="inputemail" readonly={true} value={currEmail ?? 'None'} /></p>
                <Button submit><Checkmark alt="Revoke Invite" />Revoke Invite</Button> 
            {/if}
    </form>
    {/if}
</article>

<style>
    @import url('../../../../pages/vars.css');

</style>
