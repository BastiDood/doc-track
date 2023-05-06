<script lang="ts">
    import { Invitation } from '~model/invitation';
    import { Office } from '~model/office';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore';
    import { assert } from '../../../../assert.ts';
    import { Invite } from '../../../../api/invite.ts';
    import { inviteList } from '../../../../pages/dashboard/stores/InviteStore.ts';
    import { ButtonType, IconColor } from '../../../types.ts';

    import Button from '../../Button.svelte';
    import PersonDelete from '../../../icons/PersonDelete.svelte';

    export let email: Invitation['email'];
    export let office: Office['id'];

    $: officeName = $allOffices[office] ?? 'No office name.';

    async function removeInviteHandler() {
        assert(email);
        assert(office);
        try {
            await Invite.revoke({
                office,
                email,
            });
            await inviteList.reload?.();
        } catch (err) {
            alert(err);
        }
    }

</script>

<p> Are you sure you want to remove the invitation for {email} in {officeName}?</p>
<Button type={ButtonType.Danger} 
    on:click={() => removeInviteHandler()}>
    <PersonDelete color={IconColor.White} alt="Remove invitation"/> Remove Invitation
</Button>
