<script lang="ts">
    import RowTemplate from "./RowTemplate.svelte";
    import DocumentImport from "../icons/DocumentImport.svelte";
    import Checkmark from "../icons/Checkmark.svelte";
    import Close from "../icons/Close.svelte";
    import Camera from "../icons/Camera.svelte";

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
            on:click = {() => dispatch('acceptDocument', {id,})} />
        <Close
            on:click = {() => dispatch('declineDocument', {id})} />
        <Camera
            on:click = {() => dispatch('toggleCamera', {id})}/>

    </div>

</RowTemplate>