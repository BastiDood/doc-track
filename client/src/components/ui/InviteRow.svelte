<script lang="ts">
    import RowTemplate from "./RowTemplate.svelte";
    import PersonMail from "../icons/PersonMail.svelte"
    import Close from "../icons/Close.svelte";

    import { createEventDispatcher } from 'svelte';    
    import { RowEvent, RowType } from "../types.ts";

    // From invitation.ts
    export let office: number;
    export let email: string;
    export let permission: number;
    export let creation: string;
    
    const dispatch = createEventDispatcher();

    const rowEvent: RowEvent = {
        type: RowType.Invite,
        data: {office, email}
    }

</script>

<RowTemplate
    on:overflowclick = {() => dispatch('overflowclick', rowEvent)}
    on:click = {(e) => console.log(e)}
>
    <PersonMail slot="displayIcon"/>
    
    {email} Office: {office} Permission: {permission} Created on: {creation}
    <div slot="actionIcons">
        <Close 
            on:click = {() => dispatch('removeInvitation', rowEvent)} />
    </div>

</RowTemplate>