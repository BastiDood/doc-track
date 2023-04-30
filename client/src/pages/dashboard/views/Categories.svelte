<script lang="ts">
    import { categoryList } from '../stores/CategoryStore.ts';

    import DocumentBlank from '../../../components/icons/DocumentBlank.svelte';
    import RowTemplate from '../../../components/ui/RowTemplate.svelte';

    $: ({ active, retire } = $categoryList);
</script>

<article>
    <section>
        <h1>Active Categories</h1>
        {#each active as { id, name: title } (id)}
            <RowTemplate {title}>
                <DocumentBlank slot="icon" alt="Icon for {title}" />
            </RowTemplate>
        {:else}
            No active categories.
        {/each}
    </section>
    <section>
        <h1>Retired Categories</h1>
        {#each retire as { id, name: title } (id)}
            <RowTemplate {title}>
                <DocumentBlank slot="icon" alt="Icon for {title}" />
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
