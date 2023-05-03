<script lang="ts">
    import { dashboardState } from '../stores/DashboardState';
    import InviteForm from '../../../components/ui/forms/office/AddInvite.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import InviteRow from '../../../components/ui/itemrow/InviteRow.svelte';
    import { inviteList } from '../../../pages/dashboard/stores/InviteStore.ts';
    import PersonAdd from '../../../components/icons/PersonAdd.svelte';
    import { RowType, ContextPayload, Events } from '../../../components/types.ts'; 
    import InviteContext from '../../../components/ui/contextdrawer/InviteContext.svelte';

    import { IconColor, IconSize } from '../../../components/types.ts';

    let showInviteForm = false;
    let showRevokeInviteContextMenu = false;
    let currentContext = null as ContextPayload | null;
    $: ({ currentOffice } = $dashboardState);

    function overflowClickHandler(e: CustomEvent<ContextPayload>) {
        currentContext = e.detail;
        showRevokeInviteContextMenu = currentContext.ty === RowType.Invite;
    }

    function contextMenuHandler(e: CustomEvent<ContextPayload>) {
        switch (e.type) {
            case Events.RemoveInvitation:
                break;
            default: break;
        }
    }
</script>

{#if currentOffice === null}
    You must select an office before accessing the Invites page.
{:else}
    <Button on:click={() => (showInviteForm = true)}>
        <PersonAdd color={IconColor.Default} size={IconSize.Normal} alt="Invite person" />Invite User
    </Button>
    <Modal title="Invite User" bind:showModal={showInviteForm}>
        {#if $dashboardState.currentOffice === null}
            <span>No selected office.</span>
        {:else}
            <InviteForm />
        {/if}
    </Modal>
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
            <InviteContext on:contextmenu={contextMenuHandler} />
        {/if}
    {/if}
{/if}
