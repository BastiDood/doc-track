<script lang="ts">
    import { documentTest } from './sample.ts';
    import { RowEvent, RowType } from '../../../components/types.ts';

    import InboxRow from '../../../components/ui/itemrow/InboxRow.svelte'
    import InboxContext from '../../../components/ui/contextdrawer/InboxContext.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import Select from '../../../components/ui/Select.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import GlobalPermissions from '../../../components/ui/forms/GlobalPermissions.svelte';

    let showContextMenu = false;
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
    Click me to Edit Global Permissions
</Button>

<Modal title="Edit Global Permissions" bind:showModal={showPermission}>
    <GlobalPermissions />
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
