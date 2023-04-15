<script lang="ts">
    import { documentTest } from './sample.ts';
    import { RowEvent, RowType } from '../../../components/types.ts';

    import InboxRow from '../../../components/ui/itemrow/InboxRow.svelte';
    import InboxContext from '../../../components/ui/contextdrawer/InboxContext.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import Button from '../../../components/ui/Button.svelte';

    import GlobalPermissions from '../../../components/ui/forms/permissions/GlobalPermissions.svelte';
    import NewOffice from '../../../components/ui/forms/office/NewOffice.svelte';
    import EditOffice from '../../../components/ui/forms/office/EditOffice.svelte';
    import { currentUser } from '../stores/UserStore.ts';
    import { allOffices } from '../stores/OfficeStore.ts';
    import LocalPermissions from '../../../components/ui/forms/permissions/LocalPermissions.svelte';
    import OfficeSelect from '../../../components/ui/OfficeSelect.svelte';
    import CreateCategory from '../../../components/ui/forms/category/CreateCategory.svelte';
    import RenameCategory from '../../../components/ui/forms/category/RenameCategory.svelte';
    import RemoveCategory from '../../../components/ui/forms/category/RemoveCategory.svelte';
    import ActivateCategory from '../../../components/ui/forms/category/ActivateCategory.svelte';

    let currentContext: RowEvent | null = null;
    let selectedOffice: number | null = null;

    let showContextMenu = false;
    let showCreateOffice = false;
    let showEditOffice = false;
    let showLocalPermission = false;
    let showPermission = false;
    let showCreateCategory = false;
    let showEditCategory = false;
    let showRemoveCategory = false;
    let showActivateCategory = false;

    const currentlySelected = '';

    function overflowClickHandler(e: CustomEvent<RowEvent>) {
        if (!e.detail) return;
        currentContext = e.detail;
        showContextMenu = true;
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

<Modal title="Rename a Category" bind:showModal={showEditCategory}>
    <RenameCategory/>
</Modal>
<Modal title="Remove a Category" bind:showModal={showRemoveCategory}>
    <RemoveCategory/>
</Modal>
<Modal title="Activate a Category" bind:showModal={showActivateCategory}>
    <ActivateCategory/>
</Modal>
<Modal title="Create a Category" bind:showModal={showCreateCategory}>
    <CreateCategory/>
</Modal>

<Modal title="Edit Local Permissions" bind:showModal={showLocalPermission}>
    Select an Office: <OfficeSelect bind:oid={selectedOffice} offices={$allOffices}/>
    <br>
    {#if selectedOffice !== null}
        <LocalPermissions user={$currentUser} office={selectedOffice} />
    {:else}
        Current user is not a staff of the selected office.
    {/if}
</Modal>

<Modal title="Edit Global Permissions" bind:showModal={showPermission}>
    <GlobalPermissions user={$currentUser} />
</Modal>

<Modal title="Create New Office" bind:showModal={showCreateOffice}>
    <NewOffice/>
</Modal>

<Modal title="Edit Office" bind:showModal={showEditOffice}>
    <EditOffice/>
</Modal>

<p>Currently selected: {currentlySelected}</p>
<div>
    {#each documentTest as doc}
        <InboxRow
            id={doc.id}
            category={doc.category}
            title={doc.title} 
            on:overflowClick={overflowClickHandler}
        />
    {/each}
</div>

{#if currentContext?.ty === RowType.Inbox}
    <InboxContext bind:show={showContextMenu} payload={currentContext} />
{/if}
