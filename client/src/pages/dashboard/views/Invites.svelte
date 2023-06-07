<script lang="ts">
    import type { Invitation } from '~model/invitation.ts';

    import { assert } from '../../../assert.ts';
    import { ContainerType, IconColor, IconSize } from '../../../components/types.ts';

    import { dashboardState } from '../../../stores/DashboardState';
    import { inviteList } from '../../../stores/InviteStore.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';

    import Button from '../../../components/ui/Button.svelte';
    import Container from '../../../components/ui/Container.svelte';
    import InviteForm from '../../../components/ui/forms/invite/AddInvite.svelte';
    import InviteRow from '../../../components/ui/itemrow/InviteRow.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PageUnavailable from './PageUnavailable.svelte';
    import PersonAdd from '../../../components/icons/PersonAdd.svelte';
    import RevokeInvite from '../../../components/ui/forms/invite/RevokeInvite.svelte';

    enum ActiveMenu {
        CreateInvite,
        RevokeInvite
    }
    interface Context {
        email: Invitation['email'] | null;
        office: Invitation['office'] | null;
        inviteModal: ActiveMenu | null;
    }

    $: ({ currentOffice } = $dashboardState);

    let ctx = null as Context | null;

    function openRevokeInvite(email: Invitation['email'], office: Invitation['office']) {
        ctx = { email: email, office: office, inviteModal: ActiveMenu.RevokeInvite };
    }

    function openCreateInvite() {
        ctx = { email: null, office: null, inviteModal: ActiveMenu.CreateInvite };
    }

    function resetContext() {
        ctx = null;
    }

    const inviteReady = inviteList.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });
</script>

{#if currentOffice === null}
    <p>You must select an office before accessing the Invites page.</p>
{:else}
    <header>
        <h1>Invitations</h1>
        <Button on:click={openCreateInvite.bind(null)}>
            <PersonAdd color={IconColor.White} size={IconSize.Normal} alt="Invite person" /> Invite User
        </Button>
    </header>
    {#await inviteReady}
        <p>Loading invite list.</p>
    {:then}
        <Container ty={ContainerType.Enumeration}>
            {#each $inviteList as { email, permission, creation } (email)}
                <InviteRow
                    email={email}
                    office={currentOffice}
                    permission={permission}
                    iconSize={IconSize.Large}
                    creation={creation}
                    on:overflowClick={openRevokeInvite.bind(null, email, currentOffice)}
                />
            {:else}
                <p>Your office is currently not inviting anyone</p>
            {/each}
        </Container> 
    {:catch err}
        <PageUnavailable {err} />
    {/await}
{/if}
{#if ctx === null}
    <!-- Do not render anything! -->
{:else if ctx.inviteModal === ActiveMenu.CreateInvite && currentOffice}
    <Modal title="Invite User" showModal on:close={resetContext}>
            <InviteForm />
    </Modal>
{:else if ctx.inviteModal === ActiveMenu.RevokeInvite && ctx.email !== null && ctx.office !== null}
    <Modal title="Remove Invitation" showModal on:close={resetContext}>
            <RevokeInvite
                on:done={resetContext}
                email={ctx.email}
                office={ctx.office}
            />
    </Modal>
{/if}

<style>
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
