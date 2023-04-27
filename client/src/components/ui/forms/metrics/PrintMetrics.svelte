<script lang="ts">
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { Metrics as MetricsModel } from '~model/metrics.ts';

    export let register: MetricsModel['Register'];
    export let send: MetricsModel['Send'];
    export let receive: MetricsModel['Receive'];
    export let terminal: MetricsModel['Terminate'];
</script>

<p>You successfully fetched the metrics as {$userSession?.email}</p>
<ul>
    <li>Registerd: {register}</li>
    <li>Send: {send}</li>
    <li>Receive: {receive}</li>
    <li>Terminal: {terminal}</li>
</ul>

