<script lang="ts">
    import './chip-style.css';
    import { createEventDispatcher } from 'svelte';

    import DocumentBlank from '../../icons/DocumentBlank.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize, RowType, ContextPayload, Events } from '../../types.ts';
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
        ty: RowType.Inbox,
        id: doc,
    };

    function redirectHandler() {
        window.location.href = `/track?id=${doc}`;
    }
</script>

<RowTemplate
    {iconSize} 
    on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}
    on:rowContainerClick={redirectHandler}
>
    <span class="chip category">{category}</span>
    <span class="title">{title}</span>
    <span slot="secondary" class="chipcontainer">
        <span class="chip doc">#{doc}</span>
        <span class="chip timestamp">{creation.toLocaleString()}</span>
    </span>
    <DocumentBlank size={iconSize} slot="icon" alt ="An registered document" />
</RowTemplate>