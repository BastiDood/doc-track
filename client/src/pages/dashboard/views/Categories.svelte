<script lang="ts">
    import type { Category } from '~model/category.ts';

    import { categoryList } from '../../../stores/CategoryStore.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';
    import { Category as Api } from '../../../api/category.ts';
    import { ContainerType, IconSize, ToastType } from '../../../components/types.ts';

    import Button from '../../../components/ui/Button.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import DocumentBlank from '../../../components/icons/DocumentBlank.svelte';
    import RowTemplate from '../../../components/ui/RowTemplate.svelte';
    import ActivateCategoryContext from '../../../components/ui/contextdrawer/ActivateCategoryContext.svelte';
    import RemoveCategoryContext from '../../../components/ui/contextdrawer/RemoveCategoryContext.svelte';
    import CreateCategory from '../../../components/ui/forms/category/CreateCategory.svelte';
    import RenameCategory from '../../../components/ui/forms/category/RenameCategory.svelte';
    import Container from '../../../components/ui/Container.svelte';

    enum ActiveMenu {
        Create,
        Activate,
        Remove,
        Rename,
    }

    interface Context {
        cid: Category['id'];
        mode: ActiveMenu;
    }

    let ctx = null as Context | null;

    $: ({ active, retire } = $categoryList);

    async function activate(cid: Category['id']) {
        await Api.activate(cid);
        await categoryList.reload?.();
        ctx = null;
        topToastMessage.enqueue({
            type: ToastType.Success,
            title: 'Category Activation',
            body: 'You successfully activated a category.',
        });
    }

    function resetContext() {
        ctx = null;
    }

    async function remove(cid: Category['id']) {
        await Api.remove(cid);
        await categoryList.reload?.();
        topToastMessage.enqueue({
            title: 'Category Removal',
            body: 'You successfully removed a category.',
            type: ToastType.Success,
        });
        resetContext();
    }

    function openRenameModal(cid: Category['id']) {
        ctx = { cid, mode: ActiveMenu.Rename };
    }
</script>

<header>
    <h1>Categories</h1>
    <Button on:click={() => (ctx = { cid: 0, mode: ActiveMenu.Create })}>Create Category</Button>
</header>
<Container ty={ContainerType.Divider}>
    <h2>Active Categories</h2>
    <Container ty={ContainerType.Enumeration}>
        {#each active as { id, name } (id)}
            <RowTemplate on:overflowClick={() => (ctx = { cid: id, mode: ActiveMenu.Remove })}>
                <DocumentBlank slot="icon" alt="Document Icon" size={IconSize.Large}/>
                {name}
            </RowTemplate>
        {:else}
            <p>No active categories.</p>
        {/each}
    </Container>
</Container>
<Container ty={ContainerType.Divider}>
    <h2>Retired Categories</h2>
    <Container ty={ContainerType.Enumeration}>
        {#each retire as { id, name} (id)}
            <RowTemplate on:overflowClick={() => (ctx = { cid: id, mode: ActiveMenu.Activate })}>
                <DocumentBlank slot="icon" alt="Document Icon" size={IconSize.Large}/>
                {name}
            </RowTemplate>
        {:else}
            <p>No retired categories.</p>
        {/each}
    </Container>
</Container>

{#if ctx === null}
    <!-- Don't render anything! Intentionally left blank to make type inference happy. -->
{:else if ctx.mode === ActiveMenu.Create}
    <Modal showModal title="Create Category" on:close={resetContext}>
        <CreateCategory on:done={resetContext} />
    </Modal>
{:else if ctx.mode === ActiveMenu.Activate}
    <ActivateCategoryContext
        showMenu
        on:close={resetContext}
        on:activateCategory={activate.bind(null, ctx.cid)}
        on:renameCategory={openRenameModal.bind(null, ctx.cid)}
    />
{:else if ctx.mode === ActiveMenu.Remove}
    <RemoveCategoryContext
        showMenu
        on:close={resetContext}
        on:removeCategory={remove.bind(null, ctx.cid)}
        on:renameCategory={openRenameModal.bind(null, ctx.cid)}
    />
{:else if ctx.mode === ActiveMenu.Rename}
    <Modal showModal title="Rename Category" on:close={resetContext}>
        <RenameCategory cid={ctx.cid} on:done={resetContext} />
    </Modal>
{/if}

<style>
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
