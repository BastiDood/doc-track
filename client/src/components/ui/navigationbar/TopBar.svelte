<script lang="ts">
    import type { User } from '../../../../../model/src/user.ts';

    import Hamburger from '../../icons/Hamburger.svelte';
    import OfficeSelect from '../OfficeSelect.svelte';
    import { officeList } from '../../../pages/dashboard/stores/OfficeStore.ts';
    import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Styles } from 'sveltestrap';
    

    export let show = false;
    export let user: User;
    export let selectedId: number;

</script>

<nav id="navcontainer" on:click|stopPropagation on:keypress>
    <nav id="leftnav">
        <span id="icon"><Hamburger bind:open={show} on:click={() => {show = !show}} /></span>
        <OfficeSelect offices={$officeList} bind:oid={selectedId} />
    </nav>
    <h2 class="unselectable">DocTrack</h2>
    <nav id="profilenav">
        <span class="unselectable">{user.name} </span>
        <span><img class="unselectable" src={user.picture} alt="{user.name[0]}" /></span>
    </nav>
    
</nav>

<style>
    @import url('../../../pages/vars.css');

    #navcontainer {
        align-content: center;
        background-color: var(--primary-color);
        box-shadow: 0 1px var(--spacing-normal) var(--shadow-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-small);
    }

    #leftnav {
        align-content: center;
        background-color: var(--primary-color);
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: var(--spacing-large);
    }

    #profilenav {
        align-content: center;
        background-color: var(--primary-color);
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: var(--spacing-small);
    }


    #icon {
        cursor: pointer;
    }

    .unselectable {
        user-select: none;
    }

    img {
        border-radius: 50%;
        display: block;
        height: 2rem;
    }
</style>
