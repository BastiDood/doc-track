<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import DocumentImport from '../../icons/DocumentImport.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { ContextPayload, RowType, IconSize, Events } from '../../types.ts';
    import { Document } from '../../../../../model/src/document.ts';
    import { Category } from '~model/category.ts';

    export let iconSize: IconSize;
    export let doc: Document['id'];
    export let category: Category['name'];
    export let title: Document['title'];

    const dispatch = createEventDispatcher();
    const rowEvent: ContextPayload = {
        ty: RowType.AcceptDocument,
        id: doc,
    };
</script>

<RowTemplate
    title={`${title} ID: ${doc} Category: ${category}`}
    {iconSize}
    on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}
>
    <DocumentImport size={iconSize} slot="icon" alt="A pending document" />
</RowTemplate>
