<script lang="ts">
    import type { Office } from '~model/office.ts';

    import { assert } from '../../../assert.ts';
    import { IconSize, ContainerType } from '../../../components/types.ts';

    import { allOffices } from '../../../stores/OfficeStore.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';

    import Button from '../../../components/ui/Button.svelte';
    import Container from '../../../components/ui/Container.svelte';
    import Edit from '../../../components/icons/Edit.svelte';
    import EditOffice from '../../../components/ui/forms/office/EditOffice.svelte';
    import Events from '../../../components/icons/Events.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import NewOffice from '../../../components/ui/forms/office/NewOffice.svelte';
    import PageUnavailable from '../../../components/ui/PageUnavailable.svelte';
    import RowTemplate from '../../../components/ui/RowTemplate.svelte';

    enum OfficeEvents {
        Create,
        Edit,
    }

    interface Context {
        id?: Office['id'],
        mode: OfficeEvents,
    }

    let ctx = null as Context | null;

    function resetContext() {
        ctx = null;
    }

    const officeReady = allOffices.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });
</script>

{#await officeReady}
    <p>Loading office page...</p>
{:then}
    <header>
        <h1>Offices</h1>
        <Button on:click={() => (ctx = { mode: OfficeEvents.Create })}>
            Create an Office
        </Button>
    </header>
    <Container ty={ContainerType.Enumeration}>
        {#each Object.entries($allOffices) as [id, name] (id)} 
            <RowTemplate on:overflowClick={() => (ctx = { id: Number(id), mode: OfficeEvents.Edit })}>
                <Events slot="icon" alt="Events Icon" size={IconSize.Large} />
                {name}
                <Edit slot="overflow" alt="Edit Icon" size={IconSize.Large} />
            </RowTemplate>
        {:else}
            <p>No offices exist.</p>
        {/each}
    </Container>
{:catch err}
    <PageUnavailable {err} />
{/await}

{#if ctx === null}
    <!-- Don't render anything! Intentionally left blank to make type inference happy. -->
{:else if ctx.mode === OfficeEvents.Create}
    <Modal showModal title="Create New Office" on:close={resetContext}>
        <NewOffice on:done={resetContext} />
    </Modal>
{:else if ctx.mode === OfficeEvents.Edit && typeof ctx.id !== 'undefined'}
    <Modal showModal title="Edit Office" on:close={resetContext}>
        <EditOffice currId={ctx.id} on:done={resetContext} />
    </Modal>
{/if}

<style>
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
