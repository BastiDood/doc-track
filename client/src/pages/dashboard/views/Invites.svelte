<script lang="ts">
    import { Office } from '~model/office';
    import { dashboardState } from '../stores/DashboardState';

    let currentOffice: Office['id'] | null = null;

    // eslint-disable-next-line no-unused-expressions, prefer-destructuring
    $: $dashboardState.currentOffice ? currentOffice = $dashboardState.currentOffice : null;
</script>

{#if (currentOffice === null)}
    You must select an office before accessing the Invites page.
{:else}
    Invites page of Office ID {currentOffice}.
    <h1> Invites </h1>
{/if}
