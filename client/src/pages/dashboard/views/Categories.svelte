<script lang="ts">
    import { categoryList } from '../stores/CategoryStore.ts';
    import { IconSize } from '../../../components/types.ts';

    import Add from '../../../components/icons/Add.svelte';
    import Close from '../../../components/icons/Close.svelte';
    import DocumentBlank from '../../../components/icons/DocumentBlank.svelte';
    import RowTemplate from '../../../components/ui/RowTemplate.svelte';

    $: ({ active, retire } = $categoryList);
</script>

<article>
    <section>
        <h1>Active Categories</h1>
        {#each active as { id, name } (id)}
            <RowTemplate>
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
            <RowTemplate>
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
