<script lang="ts">
    import './chip-style.css';

    import type { Document } from '~model/document.ts';
    import type { Category } from '~model/category.ts';
    import type { Snapshot } from '~model/snapshot.ts';
    import type { Office } from '~model/office.ts';
    import { redirectHandler } from './util.ts';

    import { allOffices } from '../../../pages/dashboard/stores/OfficeStore.ts';

    import DocumentExport from '../../icons/DocumentExport.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize } from '../../types.ts';
    
    export let iconSize: IconSize;
    export let doc: Document['id'];
    export let category: Category['name'];
    export let title: Document['title'];
    export let target: Office['id'];
    export let creation: Snapshot['creation'];
    let targetName: Office['name'];
    
    $: targetName = $allOffices[target] ?? 'No office.';
</script>

<RowTemplate {iconSize} showOverflowIcon={false}
    on:rowContainerClick={() => redirectHandler(doc)}
>
    <span class="chip category">{category}</span>
    <span class="title">{title}</span>
    <span slot="secondary" class="chipcontainer">
        <span class="chip doc">#{doc}</span>
        <span class="chip timestamp">{creation.toLocaleString()}</span>
        <span class="chip target">Sent to: {targetName}</span>
    </span>
    <DocumentExport size={iconSize} slot="icon" alt ="An sent document" />
</RowTemplate>
