<script lang="ts">
    import './chip-style.css';
    import { createEventDispatcher } from 'svelte';

    import DocumentBlank from '../../icons/DocumentBlank.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize, Events } from '../../types.ts';
    import { deferredSnaps } from '../../../stores/DeferredStore.ts';
    import { Document } from '../../../../../model/src/document.ts';
    import { Category } from '~model/category.ts';
    import { Snapshot } from '~model/snapshot.ts';
    import { goToTrackingPage, findDeferredSnapshot } from './util.ts';
    
    export let iconSize: IconSize;
    export let doc: Document['id'];
    export let category: Category['name'];
    export let title: Document['title'];
    export let creation: Snapshot['creation'];
    export let showOverflowIcon = true;
    
    const dispatch = createEventDispatcher();
    $: isDeferred = findDeferredSnapshot($deferredSnaps, doc);
</script>

<RowTemplate
    {iconSize} 
    {showOverflowIcon}
    {isDeferred}
    on:overflowClick={() => dispatch(Events.OverflowClick)}
    on:rowContainerClick={() => goToTrackingPage(doc)}
>
    <span class="chip category">{category}</span>
    <span class="title">{title}</span>
    <span slot="secondary" class="chipcontainer">
        <span class="chip doc">#{doc}</span>
        <span class="chip timestamp">{creation.toLocaleString()}</span>
    </span>
    <DocumentBlank size={iconSize} slot="icon" alt="A registered document" />
</RowTemplate>