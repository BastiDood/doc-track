<script lang="ts">
    import { Office } from '~model/office';
    import { dashboardState } from '../stores/DashboardState';
    import { currentUser } from '../stores/UserStore.ts';

    import Modal from '../../../components/ui/Modal.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import NewOffice from '../../../components/ui/forms/office/NewOffice.svelte';
    import EditOffice from '../../../components/ui/forms/office/EditOffice.svelte';
    import CreateDocument from '../../../components/ui/forms/document/CreateDocument.svelte';
    import SubscribePushNotification from '../../../components/ui/forms/pushnotification/SubscribePushNotification.svelte';
    import UnsubscribePushNotification from '../../../components/ui/forms/pushnotification/UnsubscribePushNotification.svelte';

    import { documentInbox, documentOutbox } from '../stores/DocumentStore.ts';

    let showCreateOffice = false;
    let showEditOffice = false;
    let showCreateCategory = false;
    let showEditCategory = false;
    let showRemoveCategory = false;
    let showActivateCategory = false;
    let showCreateDocument = false;
    let showSubscribePushNotification = false;
    let showUnsubscribePushNotification = false;

    // Receiving document, invites
    let currentOffice: Office['id'] | null = null;
    let isSubscribed = false;

    $: ({ currentOffice } = $dashboardState);

    function handleIsSubscribed(e: CustomEvent<boolean>) {
        isSubscribed = e.detail;
    }
</script>

<h1>Sandbox</h1>
<Button on:click={() => (showCreateOffice = true)}>
    Create an Office
</Button>
<Button on:click={() => (showEditOffice = true)}>
    Edit an Office
</Button>
<Button on:click={() => (showCreateCategory = true)}>
    Create a Category
</Button>
<Button on:click={() => (showEditCategory = true)}>
    Rename a Category
</Button>
<Button on:click={() => (showRemoveCategory = true)}>
    Remove a Category
</Button>
<Button on:click={() => (showActivateCategory = true)}>
    Activate a Category
</Button>
<Button on:click={() => (showCreateDocument = true)}>
    Create a New Document
</Button>

{#if !isSubscribed}
    <Button on:click={() => (showSubscribePushNotification = true)}>
        Subscribe to Push Notification
    </Button>
    {:else}
    <Button on:click={() => (showUnsubscribePushNotification = true)}>
        Unsubscribe to Push Notification
    </Button>
{/if}

<Button on:click={async() => {
    await documentInbox.reload?.();
    console.log($documentInbox);
}}>
    Get Inbox Of Selected Office
</Button>

<Button on:click={async() => {
    await documentOutbox.reload?.();
    console.log($documentOutbox);
}}>
    Get Outbox Of Selected Office
</Button>

<Modal title="Rename a Category" bind:showModal={showEditCategory}>
    <RenameCategory />
</Modal>
<Modal title="Remove a Category" bind:showModal={showRemoveCategory}>
    <RemoveCategory />
</Modal>
<Modal title="Activate a Category" bind:showModal={showActivateCategory}>
    <ActivateCategory />
</Modal>
<Modal title="Create a Category" bind:showModal={showCreateCategory}>
    <CreateCategory />
</Modal>

<Modal title="Edit Global Permissions" bind:showModal={showPermission}>
    {#if $currentUser === null}
        Current user is not valid.
    {:else}
        <GlobalPermissions user={$currentUser} />
    {/if}
</Modal>

<Modal title="Create New Office" bind:showModal={showCreateOffice}>
    <NewOffice />
</Modal>

<Modal title="Edit Office" bind:showModal={showEditOffice}>
    <EditOffice />
</Modal>

<Modal title="Subscribe to Push Notification" bind:showModal={showSubscribePushNotification}>
    <SubscribePushNotification on:subscribe={handleIsSubscribed} />
</Modal>

<Modal title="Unsubscribe to Push Notification" bind:showModal={showUnsubscribePushNotification}>
    <UnsubscribePushNotification on:unsubscribe={handleIsSubscribed} />
</Modal>

<Modal title="Create Document" bind:showModal={showCreateDocument}>
    {#if currentOffice === null }
        No office selected.
    {:else}
        <CreateDocument />
    {/if}
</Modal>
