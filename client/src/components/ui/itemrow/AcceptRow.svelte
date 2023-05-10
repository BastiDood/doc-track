<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import DocumentImport from '../../icons/DocumentImport.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { ContextPayload, RowType, IconSize, Events } from '../../types.ts';
    import { Document } from '../../../../../model/src/document.ts';
    import { Category } from '~model/category.ts';
    import { Snapshot } from '~model/snapshot.ts';
    import { goToTrackingPage, findDeferredSnapshot } from './util.ts';
    import { deferredSnaps } from '../../../pages/dashboard/stores/DeferredStore.ts';

    export let iconSize: IconSize;
    export let doc: Document['id'];
    export let category: Category['name'];
    export let title: Document['title'];
    export let creation: Snapshot['creation'];
    
    $: isDeferred = findDeferredSnapshot($deferredSnaps, doc);

    const dispatch = createEventDispatcher();
    const rowEvent: ContextPayload = {
        ty: RowType.AcceptDocument,
        id: doc,
    };
</script>

<RowTemplate
    {iconSize}
    {isDeferred}
    on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}
    on:rowContainerClick={() => goToTrackingPage(doc)}
>
    {#if isDeferred} 
        <span class='chip defer'>Deferred</span>
    {/if}
    <span class="chip category">{category}</span>
    <span class="title">{title}</span>
    <span slot="secondary" class="chipcontainer">
        <span class="chip doc">#{doc}</span>
        <span class="chip timestamp">{creation.toLocaleString()}</span>
    </span>
    <DocumentImport size={iconSize} slot="icon" alt="A pending document" />
</RowTemplate>
