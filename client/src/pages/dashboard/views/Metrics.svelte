<script lang="ts">
    import type { Metrics as MetricsModel } from '~model/metrics.ts';

    import MetricsSelect from '../../../components/ui/MetricsSelect.svelte';
    import { MetricsMode } from '../../../components/types.ts';

    import { dashboardState } from '../stores/DashboardState.ts';
    import { userSummary, localSummary, globalSummary } from '../stores/MetricStore.ts';
    import { allOffices } from '../stores/OfficeStore.ts';
    import { currentUser } from '../stores/UserStore.ts';

    function selectSummary(mode?: MetricsMode, local?:MetricsModel): MetricsModel {
        switch (mode) {
            case MetricsMode.User: return $userSummary;
            case MetricsMode.Local: return $localSummary;
            case MetricsMode.Global: return $globalSummary;
            default: return { };
        }
    }

    let mode: MetricsMode | undefined;

    $: ({ currentOffice } = $dashboardState);
    // HACK: refresh metrics when office is changed
    $: metric = selectSummary(mode, $localSummary);

    $: officeName = currentOffice === null ? 'No office name.' : $allOffices[currentOffice];
    $: userName = $currentUser?.name ?? 'No user name.';
</script>

{#if currentOffice === null}
    You must select an office before accessing the Metrics page.
{:else}
    <h1>Metrics</h1>
    {#if mode === MetricsMode.User}
        <p>You are viewing the metrics of user {userName}.</p>
    {:else if mode === MetricsMode.Local}
        <p>You are viewing the metrics of office {officeName}.</p>
    {:else if mode === MetricsMode.Global}
        <p>You are viewing the global metrics.</p>
    {/if}
    <main>
        <div class='header'>
            <h3>Report</h3>
            <MetricsSelect bind:value={mode} />
        </div>
        <table>
            <tr>
                <td>Registered</td>
                <td>{metric.Register ?? 0}</td>
            </tr>
            <tr>
                <td>Sent</td>
                <td>{metric.Send ?? 0}</td>
            </tr>
            <tr>
                <td>Received</td>
                <td>{metric.Receive ?? 0}</td>
            </tr>
            <tr>
                <td>Tagged as Terminal</td>
                <td>{metric.Terminate ?? 0}</td>
            </tr>
        </table>
    </main>
{/if}

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        width: 50vw;
    }

    table {
        border-collapse: collapse;
        width: 50vw;
    }

    table, td {
        border: 1px solid;
    }
</style>
