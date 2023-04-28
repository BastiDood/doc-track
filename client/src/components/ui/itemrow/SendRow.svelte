<script lang="ts">
    import DocumentExport from '../../icons/DocumentExport.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize } from '../../types.ts';
    import { Document } from '../../../../../model/src/document.ts';
    import { Category } from '~model/category.ts';
    
    export let iconSize: IconSize;
    export let doc: Document['id'];
    export let category: Category['name'];
    export let title: Document['title'];
    export let target: number | null;

    $: target ??= 0;
</script>

<RowTemplate {iconSize} title={`${title} ID: ${doc} Category: ${category} Sent to Office: ${target}`}>
    <DocumentExport size={iconSize} slot="icon" alt ="An sent document" />
</RowTemplate>
