<script>
    import { dashboardState } from '../stores/DashboardState';
    import { Document as Api } from '../../../api/document.ts';
    import RegisterRow from '../../../components/ui/itemrow/RegisterRow.svelte';
    import { IconSize } from '../../../components/types.ts';

    $: ({ currentOffice } = $dashboardState);
</script>

{#if currentOffice === null}
    You must select an office before accessing the Dossier page.
{:else}
    <h1>Dossier</h1>
    {#await Api.getDossier(currentOffice)}
        Loading registered documents.
    {:then reg}
        {#each reg as entry (entry.doc)}
            <RegisterRow 
                {...entry}
                showOverflowIcon={false}
                iconSize={IconSize.Large} 
            />
        {:else}
            No documents were yet.
        {/each}
    {/await}
{/if}
