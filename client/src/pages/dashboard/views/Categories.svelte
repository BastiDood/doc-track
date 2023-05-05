<script lang="ts">
    import type { Category } from '~model/category.ts';

    import { categoryList } from '../stores/CategoryStore.ts';
    import { Category as Api } from '../../../api/category.ts';
    import { sendNotification } from '../../../notification.ts';

    import DocumentBlank from '../../../components/icons/DocumentBlank.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import RowTemplate from '../../../components/ui/RowTemplate.svelte';

    import ActivateCategoryContext from '../../../components/ui/contextdrawer/ActivateCategoryContext.svelte';
    import RemoveCategoryContext from '../../../components/ui/contextdrawer/RemoveCategoryContext.svelte';
    import RenameCategory from '../../../components/ui/forms/category/RenameCategory.svelte';

    enum ActiveMenu {
        Activate,
        Remove,
        Rename,
    }

    interface Context {
        cid: Category['id'];
        mode: ActiveMenu;
    }

    let ctx: Context | null = null;

    $: ({ active, retire } = $categoryList);

    async function activate(cid: Category['id']) {
        // TODO: Prefer less intrusive toast messages rather than notifications
        const name = await Api.activate(cid);
        if (name === null) await sendNotification('Category Activation', { body: `Failed to activate non-existent category "${name}".` });
        else await sendNotification('Category Activation', { body: `You just reactivated category "${name}".` });

        // Refresh the stores
        await categoryList.reload?.();
        ctx = null;
    }

    async function remove(cid: Category['id']) {
        // TODO: Prefer less intrusive toast messages rather than notifications
        const result = await Api.remove(cid);
        switch (result) {
            case true:
                await sendNotification('Category Deprecation', { body: 'Successfully removed the category from the system.' });
                break;
            case false:
                await sendNotification('Category Deprecation', { body: 'Successfully deprecated the category.' });
                break;
            case null:
                await sendNotification('Category Deprecation', { body: 'Failed to remove non-existent category.' });
                break;
        }

        // Refresh the stores
        await categoryList.reload?.();
        ctx = null;
    }

    function openRenameModal(cid: Category['id']) {
        ctx = { cid, mode: ActiveMenu.Rename };
    }
</script>

<article>
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
{:else if ctx.mode === ActiveMenu.Activate}
    <ActivateCategoryContext
        showMenu
        on:activateCategory={activate.bind(null, ctx.cid)}
        on:renameCategory={openRenameModal.bind(null, ctx.cid)}
    />
{:else if ctx.mode === ActiveMenu.Remove}
    <RemoveCategoryContext
        showMenu
        on:removeCategory={remove.bind(null, ctx.cid)}
        on:renameCategory={openRenameModal.bind(null, ctx.cid)}
    />
{:else if ctx.mode === ActiveMenu.Rename}
    <Modal showModal title="Rename Category">
        <RenameCategory cid={ctx.cid} on:done={() => (ctx = null)} />
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
