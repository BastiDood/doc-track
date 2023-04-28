<script lang="ts">
    import type { Document } from '~model/document.ts';
    import type { Category } from '~model/category.ts';
    import type { Office } from '~model/office.ts';

    import DocumentExport from '../../icons/DocumentExport.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize } from '../../types.ts';
    
    export let iconSize: IconSize;
    export let doc: Document['id'];
    export let category: Category['name'];
    export let title: Document['title'];
    export let target: Office['id'];
</script>

<RowTemplate {iconSize} title={`${title} ID: ${doc} Category: ${category} Sent to Office: ${target}`}>
    <DocumentExport size={iconSize} slot="icon" alt ="An sent document" />
</RowTemplate>
