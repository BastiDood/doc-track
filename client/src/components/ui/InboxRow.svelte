<script lang="ts">
    import RowTemplate from "./RowTemplate.svelte.js";
    import DocumentBlank from "../Icons/DocumentBlank.svelte";
    import SendAlt from "../Icons/SendAlt.svelte";
    import CheckboxIndeterminateFilled from "../Icons/CheckboxIndeterminateFilled.svelte";

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
    <DocumentBlank slot="displayIcon"/>
    {title} ID: {id} Category: {category}
    
    <div slot="actionIcons">
        <SendAlt
        on:click = {() => dispatch('sendDocument', {id})} />
        <CheckboxIndeterminateFilled
        on:click = {() => dispatch('terminateDocument', {id})} />
    </div>

</RowTemplate>