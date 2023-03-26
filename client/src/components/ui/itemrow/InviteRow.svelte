<script lang="ts">
    import { createEventDispatcher } from 'svelte';    

    import PersonMail from '../icons/PersonMail.svelte'
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize, InvitePayload, RowType, Events } from '../../types.ts';

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

<RowTemplate title={`${email} Office: ${office} Permission: ${permission} Created on: ${creation}`}{iconSize} on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}>
    <PersonMail size={iconSize} slot="icon" alt="An invited person"/>
</RowTemplate>
