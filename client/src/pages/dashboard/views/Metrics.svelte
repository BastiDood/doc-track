<script lang="ts">
    import type { Metrics } from '~model/metrics.ts';

    import MetricsSelect from '../../../components/ui/MetricsSelect.svelte';
    import { ContainerType, MetricsMode } from '../../../components/types.ts';

    import { dashboardState } from '../../../stores/DashboardState.ts';
    import { userSummary, localSummary, globalSummary } from '../../../stores/MetricStore.ts';
    import { allOffices } from '../../../stores/OfficeStore.ts';
    import { currentUser, userSession } from '../../../stores/UserStore.ts';
    import Container from '../../../components/ui/Container.svelte';
    function selectSummary(user: Metrics, local: Metrics, global: Metrics, mode?: MetricsMode): Metrics {
        switch (mode) {
            case MetricsMode.User: return user;
            case MetricsMode.Local: return local;
            case MetricsMode.Global: return global;
            default: return { };
        }
    }

    // HACK: refresh metrics when office is changed
    let mode: MetricsMode | undefined;
    $: metric = selectSummary($userSummary, $localSummary, $globalSummary, mode);

    $: ({ currentOffice } = $dashboardState);
    $: officeName = currentOffice === null ? 'No office name.' : $allOffices[currentOffice];
    $: userName = $currentUser?.name ?? 'No user name.';

    $: localPermission = (currentOffice ? $userSession?.local_perms[currentOffice] : null) ?? null;
    $: globalPermission = $userSession?.global_perms ?? null;
</script>

{#if localPermission === null || globalPermission === null}
    <p>You must select an office before accessing the Metrics page.</p>
{:else}
    <h1>Metrics</h1>
    <Container ty={ContainerType.Divider}>
        <article>
            {#if mode === MetricsMode.User}
                <p>You are viewing the metrics of user {userName}.</p>
            {:else if mode === MetricsMode.Local}
                <p>You are viewing the metrics of office {officeName}.</p>
            {:else if mode === MetricsMode.Global}
                <p>You are viewing the global metrics.</p>
            {/if}
            <div class='header'>
                <h3>Report</h3>
                <MetricsSelect bind:value={mode} {localPermission} {globalPermission} />
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
        </article>
    </Container>
{/if}

<style>
    article {
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
