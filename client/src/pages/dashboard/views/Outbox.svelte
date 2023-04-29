<script lang="ts">
    import { Office } from '~model/office';
    import { Status } from '../../../../../model/src/snapshot.ts';
    import { dashboardState } from '../stores/DashboardState';
    import { documentOutbox } from '../stores/DocumentStore';
    
    import { IconSize, Events, RowType, ContextPayload } from '../../../components/types';
    import InboxContext from '../../../components/ui/contextdrawer/InboxContext.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import InsertSnapshot from '../../../components/ui/forms/document/InsertSnapshot.svelte';
    import RegisterRow from '../../../components/ui/itemrow/RegisterRow.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import CreateDocument from '../../../components/ui/forms/document/CreateDocument.svelte';
    import SendRow from '../../../components/ui/itemrow/SendRow.svelte';

    let currentOffice: Office['id'] | null = null;

    // eslint-disable-next-line prefer-destructuring
    $: if ($dashboardState.currentOffice !== null) currentOffice = $dashboardState.currentOffice;

    let showContextMenu = false;
    let showInsertSnapshot = false;
    let showCreateDocument = false;

    let insertSnapshotAction = null as Status | null;
    let currentContext = null as ContextPayload | null;

    function overflowClickHandler(e: CustomEvent<ContextPayload>) {
        currentContext = e.detail;
        showContextMenu = true;
    }

    function contextMenuHandler(e: CustomEvent<ContextPayload>) {
        switch (e.type) {
            case Events.SendDocument:
                insertSnapshotAction = Status.Send;
                break;
            case Events.TerminateDocument:
                insertSnapshotAction = Status.Terminate;
                break;
            default: break;
        }
        if (currentOffice) showInsertSnapshot = true;
    }
</script>

{#if currentOffice === null}
    You must select an office before accessing the Outbox page.
{:else}
    <h1>Outbox</h1>
    
    <Button on:click={() => (showCreateDocument = true)}>
        Register and Stage a New Document
    </Button>

    <h2>Staged Registered Documents</h2>
    {#if $documentOutbox?.ready.length === 0 }
        No staged registered documents.
    {:else}
        {#each $documentOutbox?.ready as register (register.doc)}
            <RegisterRow 
                {...register}
                iconSize={IconSize.Large} 
                on:overflowClick = {overflowClickHandler}
            />
        {/each}
    {/if}
    <h2>Sent Documents</h2>
    {#if $documentOutbox?.pending.length === 0 }
        No documents pending in outbox.
    {:else}
        {#each $documentOutbox?.pending as pending (pending.doc)}
            <SendRow iconSize={IconSize.Large} {...pending} />
        {/each}
    {/if}
    
    {#if currentContext?.ty === RowType.Inbox}
        <InboxContext
            bind:show={showContextMenu}
            payload={currentContext} 
            on:sendDocument={contextMenuHandler}
            on:terminateDocument={contextMenuHandler}   
        />
    {/if}

    <Modal title="Insert Snapshot" bind:showModal={showInsertSnapshot}>
        {#if insertSnapshotAction === null || currentContext === null || !showInsertSnapshot}
            Invalid parameters.
        {:else}
            <InsertSnapshot
                payload={currentContext}
                userOfficeId={currentOffice}
                status={insertSnapshotAction}
            /> 
        {/if}
    </Modal>
    <Modal title="Create Document" bind:showModal={showCreateDocument}>
        <CreateDocument />
    </Modal>
{/if}
