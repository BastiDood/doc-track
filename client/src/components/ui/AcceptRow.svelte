<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Camera from '../icons/Camera.svelte';
    import Checkmark from '../icons/Checkmark.svelte';
    import Close from '../icons/Close.svelte';
    import DocumentImport from '../icons/DocumentImport.svelte';
    import RowTemplate from './RowTemplate.svelte';

    import { type RowEvent, RowType } from '../types.ts';

    export let id: string;
    export let category: number;
    export let title: string;

    const dispatch = createEventDispatcher();
    const rowEvent: RowEvent = {
        type: RowType.AcceptDocument,
        data: { id },
    };
</script>

<RowTemplate on:overflowclick = {() => dispatch('overflowclick', rowEvent)}>
    <DocumentImport slot="displayIcon"/>
    {title} ID: {id} Category: {category}
    <div slot="actionIcons">
        <Checkmark on:click = {() => dispatch('acceptDocument', rowEvent)} />
        <Close on:click = {() => dispatch('declineDocument', rowEvent)} />
        <Camera on:click = {() => dispatch('toggleCamera', rowEvent)} />
    </div>
</RowTemplate>
