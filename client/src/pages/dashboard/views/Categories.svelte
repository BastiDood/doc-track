<script lang="ts">
    import type { Category } from '~model/category.ts';

    import { categoryList } from '../stores/CategoryStore.ts';
    import { Category as Api } from '../../../api/category.ts';

    import Button from '../../../components/ui/Button.svelte';
    import Modal from '../../../components/ui/Modal.svelte';

    import DocumentBlank from '../../../components/icons/DocumentBlank.svelte';
    import RowTemplate from '../../../components/ui/RowTemplate.svelte';

    import ActivateCategoryContext from '../../../components/ui/contextdrawer/ActivateCategoryContext.svelte';
    import RemoveCategoryContext from '../../../components/ui/contextdrawer/RemoveCategoryContext.svelte';

    import CreateCategory from '../../../components/ui/forms/category/CreateCategory.svelte';
    import RenameCategory from '../../../components/ui/forms/category/RenameCategory.svelte';

    import { topToastMessage } from '../stores/ToastStore.ts';
    import { ToastType } from '../../../components/types.ts';

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
        topToastMessage.enqueue({ title: 'Category Activation', body: 'You successfully activated a category.', type: ToastType.Success });
    }

    function resetContext() {
        ctx = null;
    }

    async function remove(cid: Category['id']) {
        await Api.remove(cid);
        await categoryList.reload?.();
        topToastMessage.enqueue({ title: 'Category Removal', body: 'You successfully removed a category.', type: ToastType.Success });
        resetContext();
    }

    function openRenameModal(cid: Category['id']) {
        ctx = { cid, mode: ActiveMenu.Rename };
    }
</script>

<article>
    <Button on:click={() => (ctx = { cid: 0, mode: ActiveMenu.Create })}>Create Category</Button>
    <section>
        <h1>Active Categories</h1>
        {#each active as { id, name } (id)}
            <RowTemplate on:overflowClick={() => (ctx = { cid: id, mode: ActiveMenu.Remove })}>
                <DocumentBlank slot="icon" alt="Document Icon" />
                {name}
            </RowTemplate>
        {:else}
            No active categories.
        {/each}
    </section>
    <section>
        <h1>Retired Categories</h1>
        {#each retire as { id, name} (id)}
            <RowTemplate on:overflowClick={() => (ctx = { cid: id, mode: ActiveMenu.Activate })}>
                <DocumentBlank slot="icon" alt="Document Icon" />
                {name}
            </RowTemplate>
        {:else}
            No retired categories.
        {/each}
    </section>
</article>

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
    h1 {
        margin: var(--spacing-large) 0;
    }

    article {
        margin: var(--spacing-medium);
    }
</style>
