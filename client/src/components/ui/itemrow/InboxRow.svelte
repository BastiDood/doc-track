<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import DocumentBlank from '../../icons/DocumentBlank.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize, ContextPayload, RowType, Events } from '../../types.ts';
    import { Document } from '../../../../../model/src/document.ts';


    export let iconSize = IconSize.Normal;
    export let id: Document['id'];
    export let category: Document['category'];
    export let title: Document['title'];

    const dispatch = createEventDispatcher();
    const rowEvent: ContextPayload = {
        ty: RowType.Inbox,
        id,
    };
</script>

<RowTemplate
    title={`${title} ID: ${id} Category: ${category}`}
    {iconSize} 
    on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}
>
    <DocumentBlank size={iconSize} slot="icon" alt ="An inbox document" />
</RowTemplate>
