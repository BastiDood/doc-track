<script lang="ts">
    import type { Metrics as MetricsModel } from '~model/metrics.ts';

    import { dashboardState } from '../stores/DashboardState.ts';
    import { userSummary, localSummary, globalSummary } from '../stores/MetricStore.ts';

    // eslint-disable-next-line prefer-destructuring
    $: currentOffice = $dashboardState.currentOffice;

    let metricsMode: 'user' | 'local' | 'global' | undefined;
    let metric: MetricsModel | null = null;

    $: switch (metricsMode) {
        case 'user':
            metric = $userSummary;
            break;
        case 'local':
            metric = $localSummary;
            break;
        case 'global':
            metric = $globalSummary;
            break;
        default:
            metric = null;
            break;
    }
</script>

{#if currentOffice === null}
    You must select an office before accessing the Metrics page.
{:else}
    <h1>Metrics</h1>
    <main>
        <div class='header'>
            <h3>Report</h3>
            <select required bind:value={metricsMode}>
                <option value="user">User Summary</option>
                <option value="local">Local Summary</option>
                <option value="global">Global Summary</option>
            </select>
        </div>

        <table>
            <tr>
                <td>Registered</td>
                <td>{metric?.Register ?? 0}</td>
            </tr>
            <tr>
                <td>Sent</td>
                <td>{metric?.Send ?? 0}</td>
            </tr>
            <tr>
                <td>Received</td>
                <td>{metric?.Receive ?? 0}</td>
            </tr>
            <tr>
                <td>Tagged as Terminal</td>
                <td>{metric?.Terminate ?? 0}</td>
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
