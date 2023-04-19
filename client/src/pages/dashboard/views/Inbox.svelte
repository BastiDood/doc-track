<script lang="ts">
    import { Office } from '~model/office';
    import { dashboardState } from '../stores/DashboardState';

    let currentOffice: Office['id'] | null = null;

    // eslint-disable-next-line prefer-destructuring
    $: if ($dashboardState.currentOffice !== null) currentOffice = $dashboardState.currentOffice;
</script>

{#if (currentOffice === null)}
    You must select an office before accessing the Inbox page.
{:else}
    Inbox page of Office ID {currentOffice}.
    <h1>Inbox</h1>
    <h2>To Be Accepted</h2>
    <h2>Office Inbox</h2>
{/if}
