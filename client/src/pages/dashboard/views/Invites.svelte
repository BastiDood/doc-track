<script lang="ts">
    import { Office } from '~model/office';
    import { dashboardState } from '../stores/DashboardState';

    let currentOffice: Office['id'] | null = null;

    // eslint-disable-next-line prefer-destructuring
    $: if ($dashboardState.currentOffice !== null) currentOffice = $dashboardState.currentOffice;
</script>

{#if (currentOffice === null)}
    You must select an office before accessing the Invites page.
{:else}
    Invites page of Office ID {currentOffice}.
    <h1> Invites </h1>
{/if}
