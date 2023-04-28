<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import DocumentBlank from '../../icons/DocumentBlank.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize, ContextPayload, RowType, Events } from '../../types.ts';
    import { Document } from '../../../../../model/src/document.ts';
    import { Category } from '~model/category.ts';

    export let iconSize: IconSize;
    export let doc: Document['id'];
    export let category: Category['name'];
    export let title: Document['title'];

    const dispatch = createEventDispatcher();
    const rowEvent: ContextPayload = {
        ty: RowType.Inbox,
        id: doc,
    };
</script>

<RowTemplate
    title={`${title} ID: ${doc} Category: ${category}`}
    {iconSize} 
    on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}
>
    <DocumentBlank size={iconSize} slot="icon" alt ="An inbox document" />
</RowTemplate>
