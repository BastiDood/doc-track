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
    import GenerateBarcode from '../../../components/ui/forms/GenerateBarcode.svelte';

    let showContextMenu = false;
    let showCreateOffice = false;
    let showEditOffice = false;
    let showGenerateBarcode = false;
    let currentContext: RowEvent | null = null;
    let currentlySelected = '';
    let showPermission = false;

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

<Button on:click={() => showGenerateBarcode = true}>
    Generate A Barcode
</Button>

<Modal title="Generate Barcodes" bind:showModal={showGenerateBarcode}>
    <GenerateBarcode/>
</Modal>
<Modal title="Edit Global Permissions" bind:showModal={showPermission}>
    <GlobalPermissions />
</Modal>

<Modal title="Create New Office" bind:showModal={showCreateOffice}>
    <NewOffice/>
</Modal>

<Modal title="Edit Office" bind:showModal={showEditOffice}>
    <EditOffice/>
</Modal>

<Select
    bind:value={currentlySelected}
    options={[ 'Test Office 1', 'Test Office 2', 'Test Office 3' ]}
/>
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
