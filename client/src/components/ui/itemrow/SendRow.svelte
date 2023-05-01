<script lang="ts">
    import './chip-style.css';

    import type { Document } from '~model/document.ts';
    import type { Category } from '~model/category.ts';
    import type { Snapshot } from '~model/snapshot.ts';

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

    function redirectHandler() {
        window.location.href = `/track?id=${doc}`;
    }

    const targetName = target ? $allOffices[target] : '';
    const docDisplay = `${doc.slice(0,5)}...${doc.slice(-5)}`;
</script>

<RowTemplate {iconSize} showOverflowIcon={false}
    on:rowContainerClick={redirectHandler}
>
    <span class="chip category">{category}</span>
    <span class="title">{title}</span>
    <span slot="secondary" class="chipcontainer">
        <span class="chip doc">#{docDisplay}</span>
        <span class="chip timestamp">{creation.toLocaleString()}</span>
        <span class="chip target">Sent to: {targetName}</span>
    </span>
    <DocumentExport size={iconSize} slot="icon" alt ="An sent document" />
</RowTemplate>
