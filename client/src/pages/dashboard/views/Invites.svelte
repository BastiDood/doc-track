<script lang="ts">
    import { dashboardState } from '../stores/DashboardState';
    import InviteForm from '../../../components/ui/forms/office/AddInvite.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import InviteRow from '../../../components/ui/itemrow/InviteRow.svelte';
    import { inviteList } from '../../../pages/dashboard/stores/InviteStore.ts';

    import type { Invitation } from '../../../../model/src/invitation.ts';
    import { IconSize } from '../../../components/types.ts';

    let showInviteForm = false;
    $: ({ currentOffice } = $dashboardState);
</script>

{#if currentOffice === null}
    You must select an office before accessing the Invites page.
{:else}
    <Button on:click={() => (showInviteForm = true)}>
        Invite User
    </Button>
    <Modal title="Invite User" bind:showModal={showInviteForm}>
        {#if $dashboardState.currentOffice === null}
            <span>No selected office.</span>
        {:else}
            <InviteForm />
        {/if}
    </Modal>
    {#if typeof $inviteList === 'undefined' || $inviteList.length === 0}
            No invite backlogs, yay!
    {:else}
        {#each $inviteList as { email, permission, creation } (email)}
            <InviteRow
                email={email}
                office={$dashboardState.currentOffice ?? 0}
                permission={permission}
                iconSize={IconSize.Large}
                creation={creation}
            />
        {/each}
    {/if}
{/if}
