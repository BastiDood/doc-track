<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import DocumentBlank from '../../icons/DocumentBlank.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize, Events } from '../../types.ts';
    import { Document } from '../../../../../model/src/document.ts';
    import { Category } from '~model/category.ts';
    import { Snapshot } from '~model/snapshot.ts';
    import { deferredSnaps } from '../../../pages/dashboard/stores/DeferredStore.ts';
    import { goToTrackingPage, findDeferredSnapshot } from './util.ts';

    export let iconSize: IconSize;
    export let doc: Document['id'];
    export let category: Category['name'];
    export let title: Document['title'];
    export let creation: Snapshot['creation'];

    const dispatch = createEventDispatcher();
    $: isDeferred = findDeferredSnapshot($deferredSnaps, doc);
</script>

<RowTemplate
    {iconSize} 
    {isDeferred}
    on:overflowClick={() => dispatch(Events.OverflowClick)}
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
    <DocumentBlank size={iconSize} slot="icon" alt ="An inbox document" />
</RowTemplate>
