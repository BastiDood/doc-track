<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Close from '../icons/Close.svelte';
    import Edit from '../icons/Edit.svelte';
    import RowTemplate from './RowTemplate.svelte';
    import Search from '../icons/Search.svelte';

    import { type RowEvent, IconSize, RowType } from '../types.ts';

    export let pictureSize = IconSize.Normal;

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
    const rowEvent: RowEvent = {
        type: RowType.Person,
        data: { id },
    };
</script>

<RowTemplate on:overflowclick = {() => dispatch('overflowclick', rowEvent)}>
    <img width={pictureSize} height={pictureSize} src={picture} alt={name} slot="displayIcon">
    {name} ID: {id} Email: {email} Office: {office} Global Perms: {globalPermission} Local Perms: {localPermission}
    <div slot="actionIcons">
        <Search on:click = {() => dispatch('showUserInfo', rowEvent)} />
        <Edit on:click = {() => dispatch('editUser', rowEvent)} />
        <Close on:click = {() => dispatch('removeUser', rowEvent)} />
    </div>
</RowTemplate>

<style>
    img {
        border-radius: 50%;
    }
</style>
