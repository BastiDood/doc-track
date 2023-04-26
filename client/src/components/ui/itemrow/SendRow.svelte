<script lang="ts">
    import DocumentExport from '../../icons/DocumentExport.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize } from '../../types.ts';
    import { Document } from '../../../../../model/src/document.ts';
    
    export let iconSize: IconSize;
    export let id: Document['id'];
    export let category: Document['category'];
    export let title: Document['title'];

</script>

<RowTemplate
    title={`${title} ID: ${id} Category: ${category}`}
    {iconSize} 
>
    <DocumentExport size={iconSize} slot="icon" alt ="An sent document" />
</RowTemplate>
