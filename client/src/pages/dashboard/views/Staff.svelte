<script lang="ts">
    import { dashboardState } from '../stores/DashboardState';

    $: ({ currentOffice } = $dashboardState);
</script>

{#if currentOffice === null}
    You must select an office before accessing the Staff page.
{:else}
    Staff page of Office ID {currentOffice}.
    <h1>Staff</h1>
{/if}
