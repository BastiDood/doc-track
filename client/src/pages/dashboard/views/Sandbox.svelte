<script lang="ts">
    import { documentTest } from './sample.ts';
    import { RowEvent, RowType } from '../../../components/types.ts';

    import InboxRow from '../../../components/ui/itemrow/InboxRow.svelte'
    import InboxContext from '../../../components/ui/contextdrawer/InboxContext.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import Select from '../../../components/ui/Select.svelte';
    import Button from '../../../components/ui/Button.svelte';

    import GlobalPermissions from '../../../components/ui/forms/permissions/GlobalPermissions.svelte';
    import NewOffice from '../../../components/ui/forms/office/NewOffice.svelte';
    import EditOffice from '../../../components/ui/forms/office/EditOffice.svelte'
    import { userSession } from '../stores/UserStore.ts';
    import { officeList } from '../stores/OfficeStore.ts';
    import LocalPermissions from '../../../components/ui/forms/permissions/LocalPermissions.svelte';
    import OfficeSelect from '../../../components/ui/OfficeSelect.svelte';

    let showContextMenu = false;
    let showCreateOffice = false;
    let showEditOffice = false;
    let showLocalPermission = false;
    let currentContext: RowEvent | null = null;
    let currentlySelected = '';
    let showPermission = false;
    let selectedOffice: number | null = null;

    function overflowClickHandler(e: CustomEvent) {
        if (!e.detail) return;
        currentContext = e.detail;
        showContextMenu = true;
    }
</script>
<h1>Sandbox</h1>

<Button on:click={() => showPermission = true}>
    Edit Global Permissions
</Button>

<Button on:click={() => showCreateOffice = true}>
    Create an Office
</Button>

<Button on:click={() => showEditOffice = true}>
    Edit an Office
</Button>

<Button on:click={() => showLocalPermission = true} disabled={$officeList.length === 0}>
    Edit Local Permission
</Button>

<Modal title="Edit Local Permissions" bind:showModal={showLocalPermission}>
    Select an Office: <OfficeSelect bind:oid={selectedOffice} offices={$officeList}/>
    <br>
    {#if selectedOffice !== null}
        {#if $userSession.local_perms[selectedOffice] !== undefined }
            <LocalPermissions user={{
                ...$userSession,
                permission: $userSession.local_perms[selectedOffice]!,
            }} office={selectedOffice} />
        {:else}
            Current user is not a staff of the selected office.
        {/if}
    {/if}
</Modal>
<Modal title="Edit Global Permissions" bind:showModal={showPermission}>
    <GlobalPermissions user={{
        ...$userSession,
        permission: $userSession.global_perms,
    }}/>
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
