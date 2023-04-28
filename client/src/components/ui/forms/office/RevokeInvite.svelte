<script lang='ts'>
    import { assert } from '../../../../assert.ts';
    import { Invite } from '../../../../api/invite.ts';

    import type { User } from '../../../../../../model/src/user.ts';
    import { inviteList } from '../../../../pages/dashboard/stores/InviteStore.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';

    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import InviteSelect from '../../InviteSelect.svelte';
    import { dashboardState } from '../../../../pages/dashboard/stores/DashboardState.ts';

    let email: User['email'] | undefined;
    async function handleSubmit(this: HTMLFormElement) {
        // Email validation
        const emailInput = this.elements.namedItem('inputemail');
        assert(emailInput instanceof HTMLInputElement);
        assert(emailInput.type === 'email');

        // Checks validity of office
        const office = $dashboardState.currentOffice;
        if (office === null || typeof email === 'undefined') return;
        if (!this.reportValidity()) return;

        try {
            await Invite.revoke({ office, email });
            await inviteList.reload?.();
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently revoking invites as {$userSession?.email}</p>
<article>
    <form on:submit|preventDefault|stopPropagation={handleSubmit}>   
        {#if typeof $inviteList === 'undefined' || $inviteList.length === 0}
            No one available to revoke invites from.
        {:else}
            <InviteSelect invites={$inviteList} bind:value={email} />
            <p>Current deleting: <input type="email" name="inputemail" readonly value={email ?? 'None'} /></p>
            <Button submit><Checkmark alt="Revoke Invite" /> Revoke Invite</Button> 
       {/if}
    </form>
</article>
