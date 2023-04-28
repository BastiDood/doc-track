<script lang="ts">
    import { Office } from '~model/office';
    import { dashboardState } from '../stores/DashboardState';
    import { documentInbox } from '../stores/DocumentStore';

    import Button from '../../../components/ui/Button.svelte';
    import AcceptRow from '../../../components/ui/itemrow/AcceptRow.svelte';
    import { IconSize, RowType, Events, ContextPayload } from '../../../components/types';
    import { Status } from '../../../../../model/src/snapshot.ts';
    import InboxRow from '../../../components/ui/itemrow/InboxRow.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import InsertSnapshot from '../../../components/ui/forms/document/InsertSnapshot.svelte';
    import CreateDocument from '../../../components/ui/forms/document/CreateDocument.svelte';
    import AcceptContext from '../../../components/ui/contextdrawer/AcceptContext.svelte';
    import InboxContext from '../../../components/ui/contextdrawer/InboxContext.svelte';

    let showCreateDocument = false;
    let showInsertSnapshot = false;
    let showAcceptContextMenu = false;
    let showInboxContextMenu = false;

    let currentOffice: Office['id'] | null = null;

    let insertSnapshotAction: Status| null = null;
    let currentContext: ContextPayload | null = null;

    // eslint-disable-next-line prefer-destructuring
    $: if ($dashboardState.currentOffice !== null) currentOffice = $dashboardState.currentOffice;

    function overflowClickHandler(e: CustomEvent<ContextPayload>) {
        if (!e.detail) return;

        currentContext = e.detail;

        showInboxContextMenu = e.detail.ty === RowType.Inbox;
        showAcceptContextMenu = e.detail.ty === RowType.AcceptDocument;
    }

    function contextMenuHandler(e: CustomEvent<ContextPayload>) {
        if (!e.detail) return;
        switch (e.type) {
            case Events.AcceptDocument:
                insertSnapshotAction = Status.Receive;
                break;
            case Events.TerminateDocument:
                insertSnapshotAction = Status.Terminate;
                break;
            case Events.SendDocument:
                insertSnapshotAction = Status.Send;
                break;
            case Events.DeclineDocument:
                insertSnapshotAction = Status.Terminate;
                break;
            default: break;
        }
        if (currentOffice) showInsertSnapshot = true;
    }
</script>    

{#if currentOffice === null}
    You must select an office before accessing the Inbox page.
{:else}
    {#await documentInbox.reload?.()}
        Loading document inbox.
    {:then} 
        <h1>Inbox</h1>

        <Button on:click={() => (showCreateDocument = true)}>
            Register and Stage a New Document
        </Button>

        <h2>Pending Acceptance</h2>
        {#if $documentInbox.pending.length === 0}
            No incoming documents.
        {:else}
            {#each $documentInbox.pending as pending (pending.doc)}
                <AcceptRow
                    {...pending}
                    iconSize = {IconSize.Large}
                    on:overflowClick = {overflowClickHandler}
                />
            {/each}
        {/if}

        <h2>Office Inbox</h2>
        {#if $documentInbox.accept.length === 0 }
            No accepted documents in Inbox
        {:else}
            {#each $documentInbox.accept as accepted (accepted.doc)}
                <InboxRow
                    {...accepted}
                    iconSize = {IconSize.Large}
                    on:overflowClick = {overflowClickHandler}
                />
            {/each}
        {/if}
    {/await}
    
    {#if currentContext?.ty === RowType.Inbox}
        <InboxContext bind:show={showInboxContextMenu} payload={currentContext} 
            on:sendDocument={contextMenuHandler}
            on:terminateDocument={contextMenuHandler}   
        />
    {/if}
    {#if currentContext?.ty === RowType.AcceptDocument}
        <AcceptContext bind:show={showAcceptContextMenu} payload={currentContext} 
            on:acceptDocument={contextMenuHandler}
            on:declineDocument={contextMenuHandler}   
        />
    {/if}
    <Modal title="Insert Snapshot" bind:showModal={showInsertSnapshot}>
        {#if currentOffice === null || currentContext === null || !showInsertSnapshot}
            No office selected.
        {:else}
            <InsertSnapshot
                payload={currentContext}
                userOfficeId={currentOffice}
                status={insertSnapshotAction}
            /> 
        {/if}
    </Modal>
    <Modal title="Create Document" bind:showModal={showCreateDocument}>
        {#if currentOffice === null }
            No office selected.
        {:else}
            <CreateDocument />
        {/if}
    </Modal>
{/if}
