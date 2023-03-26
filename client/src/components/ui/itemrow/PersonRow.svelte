<script lang="ts">
    import './row-element.css'
    import { createEventDispatcher } from 'svelte';

    import RowTemplate from '../RowTemplate.svelte';


    import { PersonPayload, IconSize, Events} from '../../types.ts';

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

<RowTemplate 
    title={`${name} ID: ${id} Email: ${email} Office: ${office} Global Perms: ${globalPermission} Local Perms: ${localPermission}`}
    {iconSize} 
    on:overflowClick={() => dispatch(Events.OverflowClick, rowEvent)}>
    <img class={iconSize} src={picture} alt={name} slot="icon">
</RowTemplate>

<style>
    img {
        border-radius: 50%;
    }
</style>
