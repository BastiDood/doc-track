<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import PersonMail from '../../icons/PersonMail.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize, InvitePayload, RowType, Events } from '../../types.ts';
    import { Invitation } from '../../../../../model/src/invitation.ts';
    export let iconSize: IconSize;

    // From invitation.ts
    export let office: Invitation['office'];
    export let email: Invitation['email'];
    export let permission: Invitation['permission'];
    export let creation: Invitation['creation'];
    
    const dispatch = createEventDispatcher();
    const rowEvent: InvitePayload = {
        ty: RowType.Invite,
        email: email,
        office: office,
    };
</script>

<RowTemplate
    title={`${email} Office: ${office} Permission: ${permission} Created on: ${creation.toDateString()}`}
    {iconSize}
    on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}
>
    <PersonMail size={iconSize} slot="icon" alt="An invited person" />
</RowTemplate>
