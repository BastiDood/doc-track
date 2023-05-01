<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import PersonMail from '../../icons/PersonMail.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize, InvitePayload, RowType, Events } from '../../types.ts';
    import { Invitation } from '../../../../../model/src/invitation.ts';
    import { allOffices } from '../../../pages/dashboard/stores/OfficeStore.ts';
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

    const targetName = office ? $allOffices[office] : '';
</script>

<RowTemplate
    on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}
>
    <span class="title">{email}</span>
    <span slot="secondary" class="chipcontainer">
        <span class="chip permission">Permission: {permission.toString(2).padStart(9, '0')}</span>
        <span class="chip target">Invite to: {targetName}</span>
        <span class="chip timestamp">Created on: {creation.toLocaleString()}</span>
    </span>
    <PersonMail size={iconSize} slot="icon" alt="An invited person" />
</RowTemplate>
