<script lang="ts">
    import RowTemplate from "./RowTemplate.svelte";
    import Search from "../icons/Search.svelte";
    import Edit from "../icons/Edit.svelte";
    import Close from "../icons/Close.svelte";

    import { createEventDispatcher } from 'svelte';
    import { IconSize, RowEvent, RowType } from '../types.ts';

    export let pictureSize = IconSize.Normal;
    // From user.ts
    export let id: string;
    export let name: string;
    export let email: string;
    export let picture: string;
    export let global_permission: number;

    // From staff.ts
    export let office: number;
    export let local_permission: number;
    export let active: boolean;
    
    const rowEvent: RowEvent = {
        type: RowType.Person,
        data: {id}
    }

    const dispatch = createEventDispatcher();

</script>

<RowTemplate
    on:overflowclick = {() => dispatch('overflowclick', rowEvent)}
    on:click = {(e) => console.log(e)}
>
    <img width={pictureSize} height={pictureSize} src={picture} alt={name} slot="displayIcon">
    
    {name} ID: {id} Email: {email} Office: {office} Global Perms: {global_permission} Local Perms: {local_permission}
    <div slot="actionIcons">
        <Search
            on:click = {() => dispatch('showUserInfo', rowEvent)} />
        <Edit 
            on:click = {() => dispatch('editUser', rowEvent)} />
        <Close 
            on:click = {() => dispatch('removeUser', rowEvent)} />
    </div>

</RowTemplate>

<style>
    img {
        border-radius: 50%;
    }
</style>