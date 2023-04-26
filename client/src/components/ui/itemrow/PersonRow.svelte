<script lang="ts">
    import './row-element.css';
    import { createEventDispatcher } from 'svelte';

    import RowTemplate from '../RowTemplate.svelte';

    import { PersonPayload, IconSize, Events, RowType } from '../../types.ts';
    import { User } from '../../../../../model/src/user.ts';
    import { Staff } from '../../../../../model/src/staff.ts';
    export let iconSize: IconSize;
    
    // From user.ts
    export let id: User['id'];
    export let name: User['name'];
    export let email: User['email'];
    export let picture: User['picture'];
    export let globalPermission: User['permission'];

    // From staff.ts
    export let office: Staff['office'];
    export let localPermission: Staff['permission'];

    const dispatch = createEventDispatcher();
    const rowEvent: PersonPayload = {
        ty: RowType.Person,
        id,
        office,
    };
</script>

<RowTemplate 
    title={`${name} ID: ${id} Email: ${email} Office: ${office} Global Perms: ${globalPermission} Local Perms: ${localPermission}`}
    {iconSize} 
    on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}
>
    <img class={iconSize} src={picture} alt={name} slot="icon" />
</RowTemplate>

<style>
    img {
        border-radius: 50%;
    }
</style>
