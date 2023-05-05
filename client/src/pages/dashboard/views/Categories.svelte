<script lang="ts">
    import type { Category } from '~model/category.ts';

    import { Category as Api } from '../../../api/category.ts';
    import { categoryList } from '../stores/CategoryStore.ts';
    import { IconSize } from '../../../components/types.ts';
    import { sendNotification } from '../../../notification.ts';

    import Add from '../../../components/icons/Add.svelte';
    import Close from '../../../components/icons/Close.svelte';
    import DocumentBlank from '../../../components/icons/DocumentBlank.svelte';
    import RowTemplate from '../../../components/ui/RowTemplate.svelte';

    $: ({ active, retire } = $categoryList);

    async function activateCategory(cid: Category['id']) {
        // TODO: Prefer less intrusive toast messages rather than notifications
        const name = await Api.activate(cid);
        if (name === null) await sendNotification('Category Activation', { body: `Failed to activate non-existent category "${name}".` });
        else await sendNotification('Category Activation', { body: `You just reactivated category "${name}".` });
        await categoryList.reload?.();
    }

    async function removeCategory(cid: Category['id']) {
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
        await categoryList.reload?.();
    }
</script>

<article>
    <section>
        <h1>Active Categories</h1>
        {#each active as { id, name } (id)}
            <RowTemplate on:overflowClick={() => removeCategory(id)}>
                {name}
                <DocumentBlank slot="icon" alt="Document Icon" />
                <Close slot="overflow" size={IconSize.Large} alt="Remove Category" />
            </RowTemplate>
        {:else}
            No active categories.
        {/each}
    </section>
    <section>
        <h1>Retired Categories</h1>
        {#each retire as { id, name} (id)}
            <RowTemplate on:overflowClick={() => activateCategory(id)}>
                {name}
                <DocumentBlank slot="icon" alt="Document Icon" />
                <Add slot="overflow" size={IconSize.Large} alt="Reinstate Category" />
            </RowTemplate>
        {:else}
            No retired categories.
        {/each}
    </section>
</article>

<style>
    h1 {
        margin: var(--spacing-large) 0;
    }

    article {
        margin: var(--spacing-medium);
    }
</style>
