<script lang="ts">
    import { Office } from '~model/office';
    import { dashboardState } from '../stores/DashboardState';

    let currentOffice: Office['id'] | null = null;

    // eslint-disable-next-line no-unused-expressions, prefer-destructuring
    $: $dashboardState.currentOffice ? currentOffice = $dashboardState.currentOffice : null;
</script>

{#if (currentOffice === null)}
    You must select an office before accessing the Inbox page.
{:else}
    Inbox page of Office ID {currentOffice}.
    <h1> Inbox </h1>
    <h2> To Be Accepted </h2>
    <h2> Office Inbox </h2>
{/if}


