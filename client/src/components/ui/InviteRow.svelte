<script lang="ts">
    import { createEventDispatcher } from 'svelte';    

    import Close from '../icons/Close.svelte';
    import PersonMail from '../icons/PersonMail.svelte'
    import RowTemplate from './RowTemplate.svelte';

    import { IconSize, InvitePayload, RowType, Events } from '../types.ts';

    export let iconSize = IconSize.Normal;

    // From invitation.ts
    export let office: number;
    export let email: string;
    export let permission: number;
    export let creation: string;
    
    const dispatch = createEventDispatcher();
    const rowEvent: InvitePayload = {
        ty: RowType.Invite,
        email: email,
        office: office,
    };
</script>

<RowTemplate {iconSize} on:overflowclick = {() => dispatch(Events.OverflowClick, rowEvent)}>
    <PersonMail size={iconSize} slot="displayIcon"/>
    <p>
        {email} Office: {office} Permission: {permission} Created on: {creation}
    </p>
    <div slot="actionIcons">
        <Close size={iconSize} on:click = {() => dispatch(Events.RemoveInvitation, rowEvent)} />
    </div>
</RowTemplate>
