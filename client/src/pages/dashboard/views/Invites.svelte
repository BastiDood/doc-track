<script>
    import { dashboardState } from '../stores/DashboardState';
    import InviteForm from '../../../components/ui/forms/office/AddInvite.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import Button from '../../../components/ui/Button.svelte';


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
{/if}
