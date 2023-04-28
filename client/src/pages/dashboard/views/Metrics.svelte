<script lang="ts">
    import { Office } from '~model/office';
    import { dashboardState } from '../stores/DashboardState.ts';
    import { Metrics } from '../../../api/metrics.ts';
    import { Metrics as MetricsModel } from '~model/metrics.ts';
    import { userSummary, localSummary, globalSummary } from '../stores/MetricStore.ts';

    import Button from '../../../components/ui/Button.svelte';
    import Download from '../../../components/icons/Download.svelte';
    import PrintMetrics from '../../../components/ui/forms/metrics/PrintMetrics.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import Select from '../../../components/ui/Select.svelte';

    let currentOffice: Office['id'] | null = null;

    // eslint-disable-next-line prefer-destructuring
    $: if ($dashboardState.currentOffice !== null) currentOffice = $dashboardState.currentOffice;

    let register: MetricsModel['Register'] = 0;
    let send: MetricsModel['Send'] = 0;
    let receive: MetricsModel['Receive'] = 0;
    let terminal: MetricsModel['Terminate'] = 0;

    let showPrintMetrics = false;
    let selectedMetrics: string;
    let metric: MetricsModel | null = null;
    
    function loadMetrics() {
        if (currentOffice === null) return;
        try {
            if (selectedMetrics === 'User Summary') metric = $userSummary;
            else if (selectedMetrics === 'Office Summary') metric = $localSummary;
            else if (selectedMetrics === 'Global Summary') metric = $globalSummary;
            else return;

            register = metric === null ? 0 : metric.Register ?? 0;
            send = metric === null ? 0 : metric.Send ?? 0;
            receive = metric === null ? 0 : metric.Receive ?? 0;
            terminal = metric === null ? 0 : metric.Terminate ?? 0;
        } catch (err) {
            // TODO: error message
            alert(err);
        }
    }

    function update(...args: any) {
        loadMetrics();
    }

    $: update(currentOffice, selectedMetrics);
</script>

{#if currentOffice === null}
    You must select an office before accessing the Metrics page.
{:else}
    <h1>Metrics</h1>
    <main>
        <div class='header'>
            <h3>Report</h3>
            <Select bind:value={selectedMetrics} options={['User Summary', 'Office Summary', 'Global Summary']} index={0} />
            <Button on:click={() => (showPrintMetrics = true)}>
                <Download alt='download' />Print Report
            </Button>
        </div>

        <table>
            <tr>
                <td>Registered</td>
                <td>{register}</td>
            </tr>
            <tr>
                <td>Sent</td>
                <td>{send}</td>
            </tr>
            <tr>
                <td>Received</td>
                <td>{receive}</td>
            </tr>
            <tr>
                <td>Tagged as Terminal</td>
                <td>{terminal}</td>
            </tr>
        </table>

        <Modal title="Print Metrics" bind:showModal={showPrintMetrics}>
            <PrintMetrics selectedMetrics={selectedMetrics} register={register} send={send} receive={receive} terminal={terminal} />
        </Modal>
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