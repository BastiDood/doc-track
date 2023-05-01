<script lang="ts">
    import './row-element.css';
    import { createEventDispatcher } from 'svelte';

    import RowTemplate from '../RowTemplate.svelte';

    import { GlobalPersonPayload, IconSize, Events, RowType } from '../../types.ts';
    import { User } from '../../../../../model/src/user.ts';
    export let iconSize: IconSize;
    
    // From user.ts
    export let id: User['id'];
    export let name: User['name'];
    export let email: User['email'];
    export let picture: User['picture'];
    export let permission: User['permission'];

    const dispatch = createEventDispatcher();
    const rowEvent: GlobalPersonPayload = {
        ty: RowType.Person,
        id,
    };
</script>

<RowTemplate 
    {iconSize} 
    on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}
>
    <span class="chip office">Operator</span>
    <span class="title">{name}</span>    
    <span slot="secondary" class="chipcontainer">
        <span class="chip email">{email}</span>
        <span class="chip doc">#{id}</span>
        <span class="chip permission">Permissions: {permission.toString(2).padStart(9, '0')}</span>
    </span>
    <img class="{iconSize} rounded" src={picture} alt={name} slot="icon" />
</RowTemplate>