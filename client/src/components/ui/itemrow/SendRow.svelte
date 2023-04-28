<script lang="ts">
    import DocumentExport from '../../icons/DocumentExport.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize } from '../../types.ts';
    import { Document } from '../../../../../model/src/document.ts';
    
    export let iconSize: IconSize;
    export let doc: Document['id'];
    export let category: Document['category'];
    export let title: Document['title'];
    export let target: number;

</script>

<RowTemplate
    title={`${title} ID: ${doc} Category: ${category} Sent to Office: ${target}`}
    {iconSize} 
>
    <DocumentExport size={iconSize} slot="icon" alt ="An sent document" />
</RowTemplate>
