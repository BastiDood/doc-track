<script lang="ts">
    import { dashboardState } from '../../../stores/DashboardState';
    import { inviteList } from '../../../stores/InviteStore.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';
    import { IconColor, IconSize } from '../../../components/types.ts';
    import { assert } from '../../../assert.ts';
    

    import Button from '../../../components/ui/Button.svelte';
    import InviteContext from '../../../components/ui/contextdrawer/InviteContext.svelte';
    import InviteForm from '../../../components/ui/forms/invite/AddInvite.svelte';
    import InviteRow from '../../../components/ui/itemrow/InviteRow.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PersonAdd from '../../../components/icons/PersonAdd.svelte';
    import RevokeInvite from '../../../components/ui/forms/invite/RevokeInvite.svelte';
    import { Invitation } from '~model/invitation.ts';

    enum ActiveMenu {
        CreateInvite,
        RevokeInvite
    }
    interface Context {
        email: Invitation['email'] | null;
        office: Invitation['office'] | null;
        contextMenu: boolean | null;
        inviteModal: ActiveMenu | null;
    }

    $: ({ currentOffice } = $dashboardState);
    let ctx = null as Context | null;

    function openContextMenu(email: Invitation['email'], office: Invitation['office']) {
        ctx = { email: email, office: office, contextMenu: true, inviteModal: null };
    }

    function openRevokeInvite(email: Invitation['email'], office: Invitation['office']) {
        ctx = { email: email, office: office, contextMenu: false, inviteModal: ActiveMenu.RevokeInvite };
    }

    function openCreateInvite() {
        ctx = { email: null, office: null, contextMenu: null, inviteModal: ActiveMenu.CreateInvite };
    }
    function resetContext() {
        ctx = null;
    }

    const invite = inviteList.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        return Promise.reject();
    });
</script>

{#if currentOffice === null}
    You must select an office before accessing the Invites page.
{:else}
    <h1>Invitations</h1>
    <Button on:click={openCreateInvite.bind(null)}>
        <PersonAdd color={IconColor.White} size={IconSize.Normal} alt="Invite person" />Invite User
    </Button>

    {#await invite}
        Loading invite list.
    {:then}
        {#if $inviteList.length === 0 || currentOffice === null}
                <h3>No invite backlogs, yay!</h3>
        {:else}
            {#each $inviteList as { email, permission, creation } (email)}
                <InviteRow
                    email={email}
                    office={currentOffice}
                    permission={permission}
                    iconSize={IconSize.Large}
                    creation={creation}
                    on:overflowClick={openContextMenu.bind(null, email, currentOffice)}
                />
            {/each}
        {/if}
    {/await}
{/if}
{#if ctx === null}
    <!-- Do not render anything! -->
{:else if ctx.inviteModal === ActiveMenu.CreateInvite && currentOffice}
    <Modal title="Invite User" showModal>
            <InviteForm />
    </Modal>
{:else if ctx.inviteModal === ActiveMenu.RevokeInvite && ctx.email !== null && ctx.office !== null}
    <Modal title="Remove Invitation" showModal>
            <RevokeInvite
                on:done={resetContext}
                email={ctx.email}
                office={ctx.office}
            />
    </Modal>
{:else if ctx.contextMenu && ctx.email !== null && currentOffice}
    <InviteContext
        show
        on:done={resetContext}
        on:removeInvitation={openRevokeInvite.bind(null, ctx.email, currentOffice)}
    />
{/if}