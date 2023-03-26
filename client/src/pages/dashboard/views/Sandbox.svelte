<script lang="ts">
    import { documentTest } from './sample.ts';
    import { RowEvent, RowType } from '../../../components/types.ts';
    import { Events } from '../../../components/types.ts'
    import InboxRow from '../../../components/ui/InboxRow.svelte';
    import InboxContext from '../../../components/ui/InboxContext.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    let showContextMenu = false;
    let showModal = false;
    let modalHeader = '';
    let modalText = '';
    let currentContext: RowEvent | null = null;
    function overflowClickHandler(e: CustomEvent) {
        if (showContextMenu) showContextMenu = false;
        if (!e.detail) return;
        currentContext = e.detail;
        showContextMenu = true;
    }
    function onBGClick() {
        if (showContextMenu) showContextMenu = false;
        if (showModal) showModal = false;
    }
    function eventHandler(e: CustomEvent) {
        if (!e.detail) return;
        switch(e.type) {
            case Events.OverflowClick:
                return;
            case Events.SendDocument:
                modalHeader = "Send Document";  
                break;
            case Events.TerminateDocument:
                modalHeader = "Terminate Document";
                break
        }
        modalText = JSON.stringify(e.detail);
        showModal = true;
    }
</script>
<h1> Sandbox </h1>

{#if showModal}
    <Modal title={modalHeader} bind:showModal>
        <p>{modalText}</p>
    </Modal>
{/if}

{#if showContextMenu && currentContext?.ty === RowType.Inbox}
    <InboxContext
        bind:show={showContextMenu}
        payload={currentContext}
        on:sendDocument={eventHandler}
        on:terminateDocument={eventHandler}
    />
{/if}
<div>
    {#each documentTest as doc}
        <InboxRow
            id={doc.id}
            category={doc.category}
            title={doc.title} 
            on:overflowClick={overflowClickHandler}
            on:sendDocument={eventHandler}
            on:terminateDocument={eventHandler}
        />
    {/each}

</div>
