<script lang="ts">
    import './chip-style.css';
    import { createEventDispatcher } from 'svelte';

    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize, Events } from '../../types.ts';
    import { allOffices } from '../../../stores/OfficeStore.ts';
    import { User } from '../../../../../model/src/user.ts';
    import { Staff } from '../../../../../model/src/staff.ts';
    
    export let iconSize: IconSize;
    
    // From user.ts
    export let id: User['id'];
    export let name: User['name'];
    export let email: User['email'];
    export let picture: User['picture'];

    // From staff.ts
    export let office: Staff['office'];
    export let permission: Staff['permission'];

    const dispatch = createEventDispatcher();
    
    $: officeName = $allOffices[office] ?? 'No office.';
</script>

<RowTemplate 
    {iconSize} 
    on:overflowClick={() => dispatch(Events.OverflowClick)}
>
    <span class="chip office">{officeName}</span>
    <span class="title">{name}</span>    
    <span slot="secondary" class="chipcontainer">
        <span class="chip email">{email}</span>
        <span class="chip doc">#{id}</span>
        <span class="chip permission">Permissions: {permission.toString(2).padStart(12, '0')}</span>
    </span>
    <img class="{iconSize} rounded" src={picture} alt={name} slot="icon" />
</RowTemplate>
