<script lang="ts">
    import './row-element.css'
    import { createEventDispatcher } from 'svelte';

    import Close from '../icons/Close.svelte';
    import Edit from '../icons/Edit.svelte';
    import RowTemplate from './RowTemplate.svelte';
    import Search from '../icons/Search.svelte';

    import { PersonPayload, IconSize, Events} from '../types.ts';

    export let iconSize = IconSize.Normal;
    
    // From user.ts
    export let id: string;
    export let name: string;
    export let email: string;
    export let picture: string;
    export let globalPermission: number;

    // From staff.ts
    export let office: number;
    export let localPermission: number;

    const dispatch = createEventDispatcher();
    const rowEvent: PersonPayload = {
        id: id,
        office: office,
    };
</script>

<RowTemplate {iconSize} on:overflowclick={() => dispatch(Events.OverflowClick, rowEvent)}>
    <img class={iconSize} src={picture} alt={name} slot="displayIcon">
    <p>
        {name} ID: {id} Email: {email} Office: {office} Global Perms: {globalPermission} Local Perms: {localPermission}
    </p>
    <div slot="actionIcons">
        <Search size={iconSize} on:click={() => dispatch(Events.ShowUserInfo, rowEvent)} />
        <Edit size={iconSize} on:click={() => dispatch(Events.EditUser, rowEvent)} />
        <Close size={iconSize} on:click={() => dispatch(Events.DeleteUser, rowEvent)} />
    </div>
</RowTemplate>

<style>
    img {
        border-radius: 50%;
    }
</style>
