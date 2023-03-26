<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import DocumentImport from '../../icons/DocumentImport.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { ContextPayload, RowType, IconSize, Events } from '../types.ts';

    export let iconSize = IconSize.Normal;
    export let id: string;
    export let category: number;
    export let title: string;

    const dispatch = createEventDispatcher();
    const rowEvent: ContextPayload = {
        ty: RowType.AcceptDocument,
        id: id,
    };
</script>

<RowTemplate title={`${title} ID: ${id} Category: ${category}`} {iconSize} on:overflowclick={() => dispatch(Events.OverflowClick, rowEvent)}>
    <DocumentImport size={iconSize} slot="icon" alt="A pending document"/>
</RowTemplate>
