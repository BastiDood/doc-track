<script lang="ts">
    import RowTemplate from "./RowTemplate.svelte";
    import DocumentImport from "../icons/DocumentImport.svelte";
    import Checkmark from "../icons/Checkmark.svelte";
    import Close from "../icons/Close.svelte";
    import Camera from "../icons/Camera.svelte";

    import { createEventDispatcher } from 'svelte';
    import { RowEvent, RowType } from "../types.ts";

    export let id: string;
    export let category: number;
    export let title: string;

    const dispatch = createEventDispatcher();

    const rowEvent: RowEvent = {
        type: RowType.AcceptDocument,
        data: {id}
    }
</script>

<RowTemplate
    on:overflowclick = {() => dispatch('overflowclick', rowEvent)}
    on:click = {(e) => console.log(e)}
>
    <DocumentImport slot="displayIcon"/>
    {title} ID: {id} Category: {category}
    
    <div slot="actionIcons">
        <Checkmark
            on:click = {() => dispatch('acceptDocument', rowEvent)} />
        <Close
            on:click = {() => dispatch('declineDocument', rowEvent)} />
        <Camera
            on:click = {() => dispatch('toggleCamera', rowEvent)}/>

    </div>

</RowTemplate>