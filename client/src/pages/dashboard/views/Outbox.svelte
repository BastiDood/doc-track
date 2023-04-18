<script lang="ts">
    import { Office } from "~model/office";
    import { dashboardState } from "../stores/DashboardState";

    let currentOffice: Office['id'] | null = null;

    $: $dashboardState.currentOffice ? currentOffice = $dashboardState.currentOffice : null;
</script>

{#if (currentOffice === null)}
    You must select an office before accessing the Outbox page.
{:else}
    Outbox page of Office ID {currentOffice}.
    <h1> Outbox </h1>
{/if}
