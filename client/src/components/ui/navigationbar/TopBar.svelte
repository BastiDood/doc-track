<script lang="ts">
    import { dashboardState } from '../../../pages/dashboard/stores/DashboardState.ts';
    import { location } from 'svelte-spa-router';
    import Button from '../../../components/ui/Button.svelte';
    import { ButtonType, IconColor } from '../../../components/types.ts';
    import Logout from '../../icons/Logout.svelte';
    import { allOffices } from '../../../pages/dashboard/stores/OfficeStore.ts';
    import { Office } from '../../../../../model/src/office.ts';

    import type { User } from '../../../../../model/src/user.ts';

    import Hamburger from '../../icons/Hamburger.svelte';

    export let show = false;
    export let user: User;
    let selectedOffice: Office['id'] | null = null;
    export let currName: Office['name'] | null = null;

    let currentPage = 'Dashboard';
    $: if ($dashboardState.currentOffice !== null) selectedOffice = $dashboardState.currentOffice;
    $: currentPage = `${$location.charAt(1).toUpperCase()}${$location.slice(2)}`;
    $: currName = $allOffices[selectedOffice === null ? 0 : selectedOffice] ?? 'No office';

</script>

<nav id="navcontainer" on:click|stopPropagation on:keypress>
    <span id="leftbar">
        {#if typeof user !== 'undefined'} 
            <span id="icon"><Hamburger bind:open={show} on:click={() => (show = !show)} /></span>
        {/if}
        <p>{currentPage} {`(${currName})`}</p>
        <slot></slot>
    </span>
    <span id="middle-logo">
        DocTrack
    </span>
    <nav id="profilenav">
        {#if typeof user !== 'undefined'} 
            <span>{user.name}</span>
            <span><img src={user.picture} alt="{user.name[0]}" /></span>
        {:else}
        <a href="/">
            <Button type={ButtonType.Primary}><Logout color={IconColor.White} alt="Return to the main Login screen"/>Back to main</Button>
        </a>
        {/if}
    </nav>
</nav>

<style>
    @import url('../../../pages/vars.css');

    span {
        color: white;
    }

    #icon {
        cursor: pointer;
    }

    img {
        border-radius: 50%;
        display: block;
        height: 2rem;
    }

    #leftbar {
        align-content: center;
        display: flex;
        gap: var(--spacing-small);
        align-items: center;
    }

    #middle-logo {
        font-size: var(--large);
        font-weight: bold;
        color: white;
    }

    #navcontainer {
        align-content: center;
        background-color: var(--primary-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-small);
        position: sticky;
        top: 0;
        z-index: 10;
    }

    #profilenav {
        align-content: center;
        background-color: var(--primary-color);
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-small);
        align-items: center;
        padding: var(--spacing-small);
    }
</style>
