<script>
    import { dashboardState } from '../stores/DashboardState';

    $: ({ currentOffice } = $dashboardState);
</script>

{#if currentOffice === null}
    You must select an office before accessing the Drafts page.
{:else}
    Drafts page of Office ID {currentOffice}.
    <h1>Drafts</h1>
{/if}
