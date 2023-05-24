<script lang="ts">
    import { Status } from '../../../../../model/src/snapshot.ts';
    import { dashboardState } from '../stores/DashboardState';
    import { documentOutbox } from '../stores/DocumentStore';
    import { earliestBatch } from '../stores/BatchStore.ts';
    import { topToastMessage } from '../stores/ToastStore.ts';
    
    import { IconSize, ToastType } from '../../../components/types';
    import InboxContext from '../../../components/ui/contextdrawer/InboxContext.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import InsertSnapshot from '../../../components/ui/forms/document/InsertSnapshot.svelte';
    import RegisterRow from '../../../components/ui/itemrow/RegisterRow.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import CreateDocument from '../../../components/ui/forms/document/CreateDocument.svelte';
    import SendRow from '../../../components/ui/itemrow/SendRow.svelte';
    import { deferRegistrationCount } from '../stores/DeferredStore.ts';
    import { Document } from '../../../../../model/src/document.ts';

    interface Context {
        docId: Document['id'] | null,
        mode: Status | null,
        context: boolean,
    }

    let ctx = null as Context | null;

    $: ({ currentOffice } = $dashboardState);

    function openContext(doc: Document['id']) {
        ctx = { docId: doc, mode: null, context: true };
    }

    function openInsertSnapshot(doc: Document['id'], mode: Status) {
        ctx = { docId: doc, mode: mode, context: false };
    }

    function openCreateDocument() {
        if ($earliestBatch === null || typeof $earliestBatch === 'undefined')
            topToastMessage.enqueue({ title: 'No available barcodes', body: 'Please generate a new batch', type: ToastType.Info });
        else
            ctx = { docId: null, mode: Status.Register, context: false };
    }

    function resetContext() {
        ctx = null;
    }
</script>
{#if currentOffice === null}
    You must select an office before accessing the Outbox page.
{:else}
    <h1>Outbox</h1>
    
    <Button on:click={openCreateDocument.bind(null)}>
        Register and Stage a New Document
    </Button>

    {#await Promise.all([documentOutbox.load(), deferRegistrationCount.load()])}
        <p>Loading outbox...</p>
    {:then}
        <h2>Staged Registered Documents</h2>
        {#each $documentOutbox.ready as { doc, category, creation, title } (doc)}
            <RegisterRow 
                {doc}
                {category}
                {title}
                {creation}
                iconSize={IconSize.Large} 
                on:overflowClick={openContext.bind(null, doc)}
            />
        {/each}
        {#if $deferRegistrationCount > 0}
            There are {$deferRegistrationCount} document/s awaiting to be registered on the next Background Sync.
        {/if}
        <h2>Sent Documents</h2>
        {#each $documentOutbox.pending as entry (entry.doc)}
            <SendRow {...entry} iconSize={IconSize.Large} />
        {/each}
    {/await}
{/if}
{#if ctx === null}
    <!-- Do not render anything! -->
{:else if ctx.mode === Status.Register}
    <Modal title="Create Document" showModal on:close={resetContext}>
        <CreateDocument on:done={resetContext} />
    </Modal>
{:else if ctx.context && ctx.docId !== null}
    <InboxContext 
    showMenu
        on:close={resetContext}
        on:sendDocument={openInsertSnapshot.bind(null, ctx.docId, Status.Send)}
        on:terminateDocument={openInsertSnapshot.bind(null, ctx.docId, Status.Terminate)}   
    />
{:else if ctx.docId !== null && currentOffice !== null && ctx.mode !== null}
    <!-- All other possible modes, Send, Terminate, Accept. -->
    <Modal title="Insert Snapshot" showModal on:close={resetContext}>
        <InsertSnapshot
            on:done={resetContext}
            docId={ctx.docId}
            userOfficeId={currentOffice}
            status={ctx.mode}
        /> 
    </Modal>
{/if}
