<script lang="ts">
    import { allOffices } from '../../../stores/OfficeStore';
    import { topToastMessage } from '../../../stores/ToastStore';
    import { Office } from '~model/office';
    import { assert } from '../../../assert';

    import Modal from '../../../components/ui/Modal.svelte';
    import RowTemplate from '../../../components/ui/RowTemplate.svelte';
    import Events from '../../../components/icons/Events.svelte';
    import Edit from '../../../components/icons/Edit.svelte';
    import NewOffice from '../../../components/ui/forms/office/NewOffice.svelte';
    import EditOffice from '../../../components/ui/forms/office/EditOffice.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import { IconSize } from '../../../components/types';

    enum OfficeEvents {
        Create,
        Edit,
    }

    interface Context {
        id: Office['id'],
        mode: OfficeEvents,
    }

    let ctx = null as Context | null;

    function resetContext() {
        ctx = null;
    }

    const offices = allOffices.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        return Promise.reject();
    });
</script>

<article>
    <Button on:click={() => (ctx = { id: 0, mode: OfficeEvents.Create })}>
        Create an Office
    </Button>

    {#await offices}
        <p>Loading office page...</p>
    {:then}
        <h1>Offices</h1>
        {#each Object.entries($allOffices) as [id, name] (id)} 
            <RowTemplate on:overflowClick={() => (ctx = { id: Number(id), mode: OfficeEvents.Edit })}>
                <Events slot="icon" alt="Events Icon" />
                {name}
                <Edit slot="overflow" alt="Edit Icon" size={IconSize.Large} />
            </RowTemplate>
        {:else}
            No offices exist.
        {/each}
    {/await}

    {#if ctx === null}
        <!-- Don't render anything! Intentionally left blank to make type inference happy. -->
    {:else if ctx.mode === OfficeEvents.Create}
        <Modal showModal title="Create New Office">
            <NewOffice on:done={resetContext} />
        </Modal>
    {:else if ctx.mode === OfficeEvents.Edit}
        <Modal showModal title="Edit Office" on:close={resetContext}>
            <EditOffice currId={ctx.id} on:done={resetContext} />
        </Modal>
    {/if}
</article>

<style>
    article {
        margin: var(--spacing-medium);
    }
</style>
