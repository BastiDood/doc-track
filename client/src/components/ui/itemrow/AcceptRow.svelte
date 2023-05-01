<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import DocumentImport from '../../icons/DocumentImport.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { ContextPayload, RowType, IconSize, Events } from '../../types.ts';
    import { Document } from '../../../../../model/src/document.ts';
    import { Category } from '~model/category.ts';
    import { Snapshot } from '~model/snapshot.ts';

    export let iconSize: IconSize;
    export let doc: Document['id'];
    export let category: Category['name'];
    export let title: Document['title'];
    export let creation: Snapshot['creation'];

    const dispatch = createEventDispatcher();
    const rowEvent: ContextPayload = {
        ty: RowType.AcceptDocument,
        id: doc,
    };

    function redirectHandler() {
        window.location.href = `/track?id=${doc}`;
    }
    
    const docDisplay = `${doc.slice(0,5)}...${doc.slice(-5)}`;
</script>

<RowTemplate
    {iconSize}
    on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}
    on:rowContainerClick={redirectHandler}
>
    <span class="chip category">{category}</span>
    <span class="title">{title}</span>
    <span slot="secondary" class="chipcontainer">
        <span class="chip doc">#{docDisplay}</span>
        <span class="chip timestamp">{creation.toLocaleString()}</span>
    </span>
    <DocumentImport size={iconSize} slot="icon" alt="A pending document" />
</RowTemplate>
