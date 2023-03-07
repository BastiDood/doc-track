<script lang="ts">
    import RowTemplate from "./RowTemplate.svelte";
    import DocumentBlank from "../icons/DocumentBlank.svelte";
    import SendAlt from "../icons/SendAlt.svelte";
    import CheckboxIndeterminateFilled from "../icons/CheckboxIndeterminateFilled.svelte";

    import { createEventDispatcher } from 'svelte';
    import { RowEvent, RowType } from "../types.ts";

    export let id: string;
    export let category: number;
    export let title: string;

    const dispatch = createEventDispatcher();

    const rowEvent: RowEvent = {
        type: RowType.Inbox,
        data: {id}
    }
</script>

<RowTemplate
    on:overflowclick = {() => dispatch('overflowclick', rowEvent)}
    on:click = {(e) => console.log(e)}
>
    <DocumentBlank slot="displayIcon"/>
    {title} ID: {id} Category: {category}
    
    <div slot="actionIcons">
        <SendAlt
            on:click = {() => dispatch('sendDocument', rowEvent)} />
        <CheckboxIndeterminateFilled
            on:click = {() => dispatch('terminateDocument', rowEvent)} />
    </div>

</RowTemplate>