<script>
    import { dashboardState } from '../stores/DashboardState';

    $: ({ currentOffice } = $dashboardState);
</script>

{#if currentOffice === null}
    You must select an office before accessing the Invites page.
{:else}
    Invites page of Office ID {currentOffice}.
    <h1>Invites</h1>
{/if}
