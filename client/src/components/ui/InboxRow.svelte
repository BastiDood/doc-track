<script lang="ts">
    import RowTemplate from "./RowTemplate.svelte";
    import DocumentImport from "../Icons/DocumentImport.svelte";
    import Checkmark from "../Icons/Checkmark.svelte";
    import Close from "../Icons/Close.svelte";
    import Camera from "../Icons/Camera.svelte";

    import { createEventDispatcher } from 'svelte';

    export let id: string;
    export let category: number;
    export let title: string;

    const dispatch = createEventDispatcher();

</script>

<RowTemplate
    on:overflowclick = {() => dispatch('overflowclick', {id})}
    on:click = {(e) => console.log(e)}
>
    <DocumentImport slot="displayIcon"/>
    {title} ID: {id} Category: {category}
    
    <div slot="actionIcons">
        <Checkmark
        on:click = {() => dispatch('acceptDocument', {id})} />
        <Close
        on:click = {() => dispatch('declineDocument', {id})} />
        <Camera
        on:click = {() => dispatch('toggleCamera', {id})}/>

    </div>

</RowTemplate>