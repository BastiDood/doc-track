<script lang="ts">
    import { createEventDispatcher } from 'svelte';    

    import Close from '../icons/Close.svelte';
    import PersonMail from '../icons/PersonMail.svelte'
    import RowTemplate from './RowTemplate.svelte';

    import { IconSize, RowEvent, RowType } from '../types.ts';

    export let iconsize = IconSize.Normal;

    // From invitation.ts
    export let office: number;
    export let email: string;
    export let permission: number;
    export let creation: string;
    
    const dispatch = createEventDispatcher();
    const rowEvent: RowEvent = {
        type: RowType.Invite,
        data: { office, email },
    };
</script>

<RowTemplate {iconsize} on:overflowclick = {() => dispatch('overflowclick', rowEvent)}>
    <PersonMail size={iconsize} slot="displayIcon"/>
    {email} Office: {office} Permission: {permission} Created on: {creation}
    <div slot="actionIcons">
        <Close size={iconsize} on:click = {() => dispatch('removeInvitation', rowEvent)} />
    </div>
</RowTemplate>
