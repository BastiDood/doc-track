<script lang="ts">
    import './chip-style.css';

    import type { Document } from '~model/document.ts';
    import type { Category } from '~model/category.ts';
    import type { Snapshot } from '~model/snapshot.ts';
    import { goToTrackingPage } from './util.ts';

    import { allOffices } from '../../../pages/dashboard/stores/OfficeStore.ts';

    import DocumentExport from '../../icons/DocumentExport.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize } from '../../types.ts';

    export let iconSize: IconSize;
    export let doc: Document['id'];
    export let category: Category['name'];
    export let title: Document['title'];
    export let target: Snapshot['target'];
    export let creation: Snapshot['creation'];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    $: targetName = target === null ? 'N/A' : $allOffices[target] ?? 'Unknown';
</script>

<RowTemplate
    {iconSize}
    showOverflowIcon={false}
    on:rowContainerClick={() => goToTrackingPage(doc)}
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
