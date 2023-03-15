<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Camera from '../icons/Camera.svelte';
    import Checkmark from '../icons/Checkmark.svelte';
    import Close from '../icons/Close.svelte';
    import DocumentImport from '../icons/DocumentImport.svelte';
    import RowTemplate from './RowTemplate.svelte';

    import { RowEvent, RowType, IconSize } from '../types.ts';

    export let iconSize = IconSize.Normal;
    export let id: string;
    export let category: number;
    export let title: string;

    const dispatch = createEventDispatcher();
    const rowEvent: RowEvent = {
        type: RowType.AcceptDocument,
        data: { id },
    };
</script>

<RowTemplate {iconSize} on:overflowclick = {() => dispatch('overflowclick', rowEvent)}>
    <DocumentImport size={iconSize} slot="displayIcon"/>
    <p>
        {title} ID: {id} Category: {category}
    </p>
    <div slot="actionIcons">
        <Checkmark size={iconSize} on:click = {() => dispatch('acceptDocument', rowEvent)} />
        <Close size={iconSize} on:click = {() => dispatch('declineDocument', rowEvent)} />
        <Camera size={iconSize} on:click = {() => dispatch('toggleCamera', rowEvent)} />
    </div>
</RowTemplate>
