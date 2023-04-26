<script lang="ts">
    import { documentTest } from './sample.ts';
    import { RowEvent, RowType, Events, SnapshotAction, IconSize } from '../../../components/types.ts';
    import { Office } from '~model/office';
    import { dashboardState } from '../stores/DashboardState';
    import { currentUser } from '../stores/UserStore.ts';
    import { allOffices } from '../stores/OfficeStore.ts';

    import InboxRow from '../../../components/ui/itemrow/InboxRow.svelte';
    import InboxContext from '../../../components/ui/contextdrawer/InboxContext.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import GlobalPermissions from '../../../components/ui/forms/permissions/GlobalPermissions.svelte';
    import NewOffice from '../../../components/ui/forms/office/NewOffice.svelte';
    import EditOffice from '../../../components/ui/forms/office/EditOffice.svelte';
    import LocalPermissions from '../../../components/ui/forms/permissions/LocalPermissions.svelte';
    import CreateCategory from '../../../components/ui/forms/category/CreateCategory.svelte';
    import RenameCategory from '../../../components/ui/forms/category/RenameCategory.svelte';
    import RemoveCategory from '../../../components/ui/forms/category/RemoveCategory.svelte';
    import ActivateCategory from '../../../components/ui/forms/category/ActivateCategory.svelte';
    import InsertSnapshot from '../../../components/ui/forms/document/InsertSnapshot.svelte';
    import CreateDocument from '../../../components/ui/forms/document/CreateDocument.svelte';
    import SubscribePushNotification from '../../../components/ui/forms/pushnotification/SubscribePushNotification.svelte';
    import UnsubscribePushNotification from '../../../components/ui/forms/pushnotification/UnsubscribePushNotification.svelte';

    // Modals
    import InviteForm from '../../../components/ui/forms/office/AddInvite.svelte';
    import RevokeInvite from '../../../components/ui/forms/office/RevokeInvite.svelte';
    import { documentStore } from '../stores/DocumentStore.ts';

    let showContextMenu = false;
    let showCreateOffice = false;
    let showEditOffice = false;
    let showLocalPermission = false;
    let showPermission = false;
    let showCreateCategory = false;
    let showEditCategory = false;
    let showRemoveCategory = false;
    let showActivateCategory = false;
    let showInsertSnapshot = false;
    let showCreateDocument = false;
    let showSubscribePushNotification = false;
    let showUnsubscribePushNotification = false;

    // Receiving document, invites
    let showInviteForm = false;
    let showRevokeInvite = false;

    let insertSnapshotAction: SnapshotAction | null = null;
    let currentContext: RowEvent | null = null;
    let currentOffice: Office['id'] | null = null;
    let isSubscribed = false;

    // eslint-disable-next-line prefer-destructuring
    $: if ($dashboardState.currentOffice !== null) currentOffice = $dashboardState.currentOffice;
    
    function overflowClickHandler(e: CustomEvent<RowEvent>) {
        if (!e.detail) return;
        currentContext = e.detail;
        showContextMenu = true;
    }

    function contextMenuHandler(e: CustomEvent<RowEvent>) {
        if (!e.detail) return;
        switch (e.type) {
            case Events.SendDocument:
                insertSnapshotAction = SnapshotAction.Send;
                break;
            case Events.TerminateDocument:
                insertSnapshotAction = SnapshotAction.Terminate;
                break;
            default: break;
        }
        if (currentOffice) showInsertSnapshot = true;
    }

    function handleIsSubscribed(e: CustomEvent<boolean>) {
        isSubscribed = e.detail;
    }
</script>

<h1>Sandbox</h1>
<Button on:click={() => (showPermission = true)}>
    Edit Global Permissions
</Button>
<Button on:click={() => (showCreateOffice = true)}>
    Create an Office
</Button>
<Button on:click={() => (showEditOffice = true)}>
    Edit an Office
</Button>
<Button on:click={() => (showLocalPermission = true)} disabled={Object.getOwnPropertyNames($allOffices).length === 0}>
    Edit Local Permission
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
<Button on:click={() => (showInviteForm = true)}>
    Invite User
</Button>
<Button on:click={() => (showRevokeInvite = true)}>
    Revoke Invite
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

<Button on:click={() => {
    documentStore.reload()
    console.log($documentStore)
}}>
    Get Inbox Of Selected Office
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

<Modal title="Edit Local Permissions" bind:showModal={showLocalPermission}>
    {#if currentOffice === null || $currentUser === null}
        Current user is not a staff of the selected office.
    {:else}
        <LocalPermissions user={$currentUser} office={currentOffice} />
    {/if}
</Modal>

<Modal title="Edit Global Permissions" bind:showModal={showPermission}>
    {#if $currentUser === null}
        Current user is not valid.
    {:else}
        <GlobalPermissions user={$currentUser} />
    {/if}
</Modal>

<Modal title="Create New Office" bind:showModal={showCreateOffice}>
    <NewOffice/>
</Modal>

<Modal title="Edit Office" bind:showModal={showEditOffice}>
    <EditOffice/>
</Modal>

<Modal title="Invite User" bind:showModal={showInviteForm}>
    {#if $dashboardState.currentOffice === null}
        <span>No selected office.</span>
    {:else}
        <InviteForm />
    {/if}
</Modal>

<Modal title="Revoke Invite" bind:showModal={showRevokeInvite}>
    {#if $dashboardState.currentOffice === null}
        <span>No selected office.</span>
    {:else}
        <RevokeInvite />
    {/if}
</Modal>

<Modal title="Insert Snapshot" bind:showModal={showInsertSnapshot}>
    {#if currentOffice === null || currentContext === null || showInsertSnapshot}
        No office selected.
    {:else}
        <InsertSnapshot
            payload={currentContext}
            userOfficeId={currentOffice}
            status={insertSnapshotAction}
        /> 
    {/if}
</Modal>

<Modal title="Subscribe to Push Notification" bind:showModal={showSubscribePushNotification}>
    <SubscribePushNotification on:subscribe={handleIsSubscribed}/>
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
<div>
    {#each documentTest as doc}
        <InboxRow
            id={doc.id}
            category={doc.category}
            title={doc.title} 
            on:overflowClick={overflowClickHandler}
            iconSize={IconSize.Large}
        />
    {/each}
</div>

{#if currentContext?.ty === RowType.Inbox}
    <InboxContext bind:show={showContextMenu} payload={currentContext} 
        on:sendDocument={contextMenuHandler}
        on:terminateDocument={contextMenuHandler}   
    />
{/if}

<style>
    h1 {
        margin: 0;
    }
</style>
