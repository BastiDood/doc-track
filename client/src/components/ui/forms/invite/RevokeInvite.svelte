<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Invitation } from '~model/invitation';
    import { Office } from '~model/office';

    import { assert } from '../../../../assert.ts';

    import { Invite } from '../../../../api/invite.ts';
    import { ButtonType, IconColor, Events, ToastType } from '../../../types.ts';

    import Button from '../../Button.svelte';
    import PersonDelete from '../../../icons/PersonDelete.svelte';

    import { inviteList } from '../../../../stores/InviteStore.ts';
    import { allOffices } from '../../../../stores/OfficeStore.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';

    export let email: Invitation['email'];
    export let office: Office['id'];

    const dispatch = createEventDispatcher();
    $: officeName = $allOffices[office] ?? 'No office name.';

    async function removeInviteHandler() {
        assert(email);
        assert(office);
        try {
            await Invite.revoke({ office, email });
            await inviteList.reload?.();
            topToastMessage.enqueue({
                type: ToastType.Success,
                title: 'Invite Revocation',
                body: 'You have successfully revoked an invite.',
            });
            dispatch(Events.Done);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

<p> Are you sure you want to remove the invitation for {email} in {officeName}?</p>
<Button type={ButtonType.Danger} 
    on:click={() => removeInviteHandler()}>
    <PersonDelete color={IconColor.White} alt="Remove invitation"/> Remove Invitation
</Button>
