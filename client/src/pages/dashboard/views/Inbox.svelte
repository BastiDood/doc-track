<script lang="ts">
    import { dashboardState } from '../../../stores/DashboardState.ts';
    import { documentInbox } from '../../../stores/DocumentStore';
    import { deferredSnaps } from '../../../stores/DeferredStore.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';
    import { earliestBatch } from '../../../stores/BatchStore.ts';
    import { assert } from '../../../assert.ts';

    import Button from '../../../components/ui/Button.svelte';
    import AcceptRow from '../../../components/ui/itemrow/AcceptRow.svelte';
    import { IconSize, ToastType } from '../../../components/types';
    import { Document } from '../../../../../model/src/document.ts';
    import { Status } from '../../../../../model/src/snapshot.ts';
    import InboxRow from '../../../components/ui/itemrow/InboxRow.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import InsertSnapshot from '../../../components/ui/forms/document/InsertSnapshot.svelte';
    import CreateDocument from '../../../components/ui/forms/document/CreateDocument.svelte';
    import AcceptContext from '../../../components/ui/contextdrawer/AcceptContext.svelte';
    import InboxContext from '../../../components/ui/contextdrawer/InboxContext.svelte';
    import PageUnavailable from '../../../components/ui/PageUnavailable.svelte';
    import EnumerationContainer from '../../../components/ui/EnumerationContainer.svelte';
    import DocumentAdd from '../../../components/icons/DocumentAdd.svelte';

    enum ActiveMenu {
        ContextInbox,
        ContextAccept,
    }

    interface Context {
        docId: Document['id'] | null,
        mode: Status | null,
        context: ActiveMenu | null,
    }

    let ctx = null as Context | null;

    $: ({ currentOffice } = $dashboardState);
    
    function openInsertSnapshot(doc: Document['id'], mode: Status) {
        ctx = { docId: doc, mode: mode, context: null };
    }

    function openCreateDocument() {
        if ($earliestBatch === null || typeof $earliestBatch === 'undefined')
            topToastMessage.enqueue({
                type: ToastType.Info,
                title: 'No available barcodes',
                body: 'Please generate a new batch',
            });
        else
            ctx = { docId: null, mode: Status.Register, context: null };
    }

    function setOpenedContext(doc: Document['id'], context: ActiveMenu) {
        ctx = { docId: doc, mode: null, context: context };
    }

    function resetContext() {
        ctx = null;
    }

    const deferReady = deferredSnaps.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });

    const inboxReady = documentInbox.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });
</script>    

{#if currentOffice === null}
    <p>You must select an office before accessing the Inbox page.</p>
{:else}
    <header>
        <h1>Inbox</h1>
        <Button on:click={openCreateDocument.bind(null)}>
            <DocumentAdd alt="Create document" color={IconColor.White}/>
            Register and Stage a New Document
        </Button>
    </header>

    {#await Promise.all([inboxReady, deferReady])}
        <p>Loading inbox...</p>
    {:then}
        <h2>Pending Acceptance</h2>
        <EnumerationContainer>
            {#each $documentInbox.pending as { creation, category, title, doc } (doc)}
                <AcceptRow
                    {doc}
                    {category}
                    {title}
                    {creation}
                    iconSize = {IconSize.Large}
                    on:overflowClick = {setOpenedContext.bind(null, doc, ActiveMenu.ContextAccept)}
                />
            {:else}
                <p>Your office does not have any documents pending to be accepted.</p>
            {/each}
        </EnumerationContainer>

        <h2>Office Inbox</h2>
        <EnumerationContainer>
            {#each $documentInbox.accept as { creation, category, title, doc } (doc)}
                <InboxRow
                    {doc}
                    {category}
                    {title}
                    {creation}
                    iconSize={IconSize.Large}
                    on:overflowClick={setOpenedContext.bind(null, doc, ActiveMenu.ContextInbox)}
                />
            {:else}
                <p>Your office does not have any documents in its inbox.</p>
            {/each}
        </EnumerationContainer>
    {:catch err}
        <PageUnavailable {err} />
    {/await}
{/if}

{#if ctx === null}
    <!-- Do not render anything! -->
{:else if ctx.mode === Status.Register}
    <Modal title="Create Document" showModal on:close={resetContext}>
        <CreateDocument on:done={resetContext} />
    </Modal>
{:else if ctx.context === ActiveMenu.ContextInbox && ctx.docId !== null}
    <InboxContext 
        showMenu
        on:close={resetContext}
        on:sendDocument={openInsertSnapshot.bind(null, ctx.docId, Status.Send)}
        on:terminateDocument={openInsertSnapshot.bind(null, ctx.docId, Status.Terminate)}   
    />
{:else if ctx.context === ActiveMenu.ContextAccept && ctx.docId !== null}
    <AcceptContext 
        showMenu  
        on:close={resetContext}
        on:acceptDocument={openInsertSnapshot.bind(null, ctx.docId, Status.Receive)}
        on:declineDocument={openInsertSnapshot.bind(null, ctx.docId, Status.Terminate)}   
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

<style>
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
