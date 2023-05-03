<script lang="ts">
    import { dashboardState } from '../stores/DashboardState';
    import { inviteList } from '../../../pages/dashboard/stores/InviteStore.ts';
    import { RowType, InvitePayload, IconColor, IconSize } from '../../../components/types.ts';

    import Button from '../../../components/ui/Button.svelte';
    import InviteContext from '../../../components/ui/contextdrawer/InviteContext.svelte';
    import InviteForm from '../../../components/ui/forms/office/AddInvite.svelte';
    import InviteRow from '../../../components/ui/itemrow/InviteRow.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PersonAdd from '../../../components/icons/PersonAdd.svelte';
    import RevokeInvite from '../../../components/ui/forms/office/RevokeInvite.svelte';

    let showInviteForm = false;
    let showRevokeInviteContextMenu = false;
    let showRevokeInviteModal = false;

    let currentContext = null as InvitePayload | null;

    $: ({ currentOffice } = $dashboardState);

    function overflowClickHandler(e: CustomEvent<InvitePayload>) {
        currentContext = e.detail;
        showRevokeInviteContextMenu = currentContext.ty === RowType.Invite;
    }


</script>

{#if currentOffice === null}
    You must select an office before accessing the Invites page.
{:else}
    <h1>Invitations</h1>
    <Button on:click={() => (showInviteForm = true)}>
        <PersonAdd color={IconColor.White} size={IconSize.Normal} alt="Invite person" />Invite User
    </Button>
    <Modal title="Invite User" bind:showModal={showInviteForm}>
        {#if $dashboardState.currentOffice === null}
            <span>No selected office.</span>
        {:else}
            <InviteForm />
        {/if}
    </Modal>
    {#await inviteList.load()}
        Loading invite list.
    {:then}
        {#if typeof $inviteList === 'undefined' || $inviteList.length === 0}
                <h3>No invite backlogs, yay!</h3>
        {:else}
            {#each $inviteList as { email, permission, creation } (email)}
                <InviteRow
                    email={email}
                    office={$dashboardState.currentOffice ?? 0}
                    permission={permission}
                    iconSize={IconSize.Large}
                    creation={creation}
                    on:overflowClick={overflowClickHandler}
                />
            {/each}
            {#if currentContext?.ty === RowType.Invite}
                <InviteContext
                    bind:show={showRevokeInviteContextMenu}
                    payload={currentContext}
                    on:removeInvitation={()=> showRevokeInviteModal = true} />
            {/if}
            <Modal title="Remove Invitation" bind:showModal={showRevokeInviteModal}>
                {#if currentContext === null }
                    Cannot remove this invitation.
                {:else}
                    <RevokeInvite {...currentContext}/>
                {/if}
            </Modal>
        {/if}
    {/await}
{/if}
