<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Camera from '../icons/Camera.svelte';
    import Checkmark from '../icons/Checkmark.svelte';
    import Close from '../icons/Close.svelte';
    import DocumentImport from '../icons/DocumentImport.svelte';
    import RowTemplate from './RowTemplate.svelte';

    import { ContextPayload, RowType, IconSize, Events } from '../types.ts';

    export let iconSize = IconSize.Normal;
    export let id: string;
    export let category: number;
    export let title: string;

    const dispatch = createEventDispatcher();
    const rowEvent: ContextPayload = {
        ty: RowType.AcceptDocument,
        id: id,
    }
</script>

<RowTemplate {iconSize} on:overflowclick = {() => dispatch(Events.OverflowClick, rowEvent)}>
    <DocumentImport size={iconSize} slot="displayIcon"/>
    <p>
        {title} ID: {id} Category: {category}
    </p>
    <div slot="actionIcons">
        <Checkmark size={iconSize} on:click = {() => dispatch(Events.AcceptDocument, rowEvent)} />
        <Close size={iconSize} on:click = {() => dispatch(Events.DeclineDocument, rowEvent)} />
        <Camera size={iconSize} on:click = {() => dispatch(Events.Camera, rowEvent)} />
    </div>
</RowTemplate>
