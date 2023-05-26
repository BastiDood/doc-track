<script lang="ts">
    import { dashboardState } from '../../../stores/DashboardState.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';
    import { assert } from '../../../assert.ts';
    import { Document as Api } from '../../../api/document.ts';
    import RegisterRow from '../../../components/ui/itemrow/RegisterRow.svelte';
    import { IconSize } from '../../../components/types.ts';
    import PageUnavailable from '../../../components/ui/PageUnavailable.svelte';

    $: ({ currentOffice } = $dashboardState);

    function loadDossier(office: number) {
        return Api.getDossier(office).catch(err => {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
            throw err;
        });
    }
    
</script>

{#if currentOffice === null}
    <p>You must select an office before accessing the Dossier page.</p>
{:else}
    <h1>Dossier</h1>
    {#await loadDossier(currentOffice)}
        <p>Loading registered documents.</p>
    {:then reg}
        {#each reg as entry (entry.doc)}
            <RegisterRow 
                {...entry}
                showOverflowIcon={false}
                iconSize={IconSize.Large} 
            />
        {:else}
            <p>No documents were created in this office yet.</p>
        {/each}
    {:catch err}
        <PageUnavailable {err} />
    {/await}
{/if}
