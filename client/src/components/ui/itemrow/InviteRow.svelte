<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Close from '../../icons/Close.svelte';
    import PersonMail from '../../icons/PersonMail.svelte';
    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize, Events } from '../../types.ts';
    import { Invitation } from '../../../../../model/src/invitation.ts';
    import { Office } from '~model/office.ts';
    import { allOffices } from '../../../stores/OfficeStore.ts';
    export let iconSize: IconSize;

    // From invitation.ts
    export let office: Invitation['office'];
    export let email: Invitation['email'];
    export let permission: Invitation['permission'];
    export let creation: Invitation['creation'];
    let targetName: Office['name'];
    
    const dispatch = createEventDispatcher();
    $: targetName = $allOffices[office] ?? 'No office.';
</script>

<RowTemplate
    on:overflowClick={() => dispatch(Events.OverflowClick)}
>
    <span class="title">{email}</span>
    <span slot="secondary" class="chipcontainer">
        <span class="chip permission">Permission: {permission.toString(2).padStart(9, '0')}</span>
        <span class="chip target">{targetName}</span>
        <span class="chip timestamp">{creation.toLocaleString()}</span>
    </span>
    <PersonMail size={iconSize} slot="icon" alt="An invited person" />
    <Close slot="overflow" alt="Close Icon" size={IconSize.Large} />
</RowTemplate>
