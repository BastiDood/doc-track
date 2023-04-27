<script lang="ts">
    import { Office } from '~model/office';
    import { dashboardState } from '../stores/DashboardState.ts';
    import { Metrics } from '../../../api/metrics.ts';
    import { Metrics as MetricsModel } from '~model/metrics.ts';

    import Button from '../../../components/ui/Button.svelte';
    import Download from '../../../components/icons/Download.svelte';
    import PrintMetrics from '../../../components/ui/forms/metrics/PrintMetrics.svelte';
    import Modal from '../../../components/ui/Modal.svelte';

    let currentOffice: Office['id'] | null = null;

    // eslint-disable-next-line prefer-destructuring
    $: if ($dashboardState.currentOffice !== null) currentOffice = $dashboardState.currentOffice;

    let register: MetricsModel['Register'] = 0;
    let send: MetricsModel['Send'] = 0;
    let receive: MetricsModel['Receive'] = 0;
    let terminal: MetricsModel['Terminate'] = 0;

    let showPrintMetrics = false;
    
    async function loadMetrics() {
        if (currentOffice === null) return;
        let localMetric = await Metrics.generateLocalSummary(currentOffice);
        register = localMetric.Register === undefined ? 0 : localMetric.Register;
        send = localMetric.Send  === undefined ? 0 : localMetric.Send;
        receive = localMetric.Receive  === undefined ? 0 : localMetric.Receive;
        terminal = localMetric.Terminate  === undefined ? 0 : localMetric.Terminate;
    }

    $: {
        currentOffice;
        loadMetrics();
    }
</script>

{#if currentOffice === null}
    You must select an office before accessing the Barcodes page.
{:else}
    <main>
        <div class='header'>
            <h3>Report</h3>
            <Button on:click={() => showPrintMetrics = true}>
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
            <PrintMetrics register={register} send={send} receive={receive} terminal={terminal} />
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
    }

    table {
        border-collapse: collapse;
    }

    table, td {
        border: 1px solid;
    }
</style>