<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import RowTemplate from '../RowTemplate.svelte';

    import { IconSize, Events } from '../../types.ts';
    import { User } from '../../../../../model/src/user.ts';
    import Edit from '../../icons/Edit.svelte';
    export let iconSize: IconSize;
    
    // From user.ts
    export let id: User['id'];
    export let name: User['name'];
    export let email: User['email'];
    export let picture: User['picture'];
    export let permission: User['permission'];

    const dispatch = createEventDispatcher();
</script>

<RowTemplate 
    {iconSize} 
    on:overflowClick={() => dispatch(Events.OverflowClick)}
>
    <span class="chip office">User</span>
    <span class="title">{name}</span>    
    <span slot="secondary" class="chipcontainer">
        <span class="chip email">{email}</span>
        <span class="chip doc">#{id}</span>
        <span class="chip permission">Permissions: {permission.toString(2).padStart(8, '0')}</span>
    </span>
    <img class="{iconSize} rounded" src={picture} alt={name} slot="icon" />
    <Edit slot="overflow" alt="Edit Icon" size={IconSize.Large} />
</RowTemplate>
