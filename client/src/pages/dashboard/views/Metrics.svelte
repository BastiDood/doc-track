<script lang="ts">
    import { Office } from '~model/office';
    import { dashboardState } from '../stores/DashboardState.ts';
    import { Metrics } from '../../../api/metrics.ts';

    import Button from '../../../components/ui/Button.svelte';
    import { ButtonType } from '../../../components/types.ts';

    import Download from '../../../components/icons/Download.svelte';
    import Close from '../../../components/icons/Close.svelte';

    let currentOffice: Office['id'] | null = null;

    // eslint-disable-next-line prefer-destructuring
    $: if ($dashboardState.currentOffice !== null) currentOffice = $dashboardState.currentOffice;

    let outbox = 0;
    let created = 0;
    let received = 0;
    let sent = 0;
    let terminal = 0;

    async function handlePrint() {
        if (currentOffice === null) return;
        try {
            console.log(await Metrics.generateLocalSummary(currentOffice));
        } catch (err) {
            // TODO: error message
            alert(err);
        }
    }

    function handleReset () {

    }
</script>

<main>
    <div class='header'>
        <h3>Report</h3>
        <Button on:click={handlePrint}>
            <Download alt='download' />Print Report
        </Button>
        <Button type={ButtonType.Danger}>
            <Close alt='close' />Reset
        </Button>
    </div>

    <table>
        <tr>
            <td>Outbox</td>
            <td>{{outbox}}</td>
        </tr>
        <tr>
            <td>Documents Created</td>
            <td>{{created}}</td>
        </tr>
        <tr>
            <td>Received</td>
            <td>{{received}}</td>
        </tr>
        <tr>
            <td>Sent</td>
            <td>{{sent}}</td>
        </tr>
        <tr>
            <td>Tagged as Terminal</td>
            <td>{{terminal}}</td>
        </tr>
    </table>
</main>


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