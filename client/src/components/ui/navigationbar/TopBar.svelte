<script lang="ts">
    import { allOffices } from '../../../pages/dashboard/stores/OfficeStore.ts';
    import { currentPage } from '../../../pages/dashboard/stores/CurrentPage.ts';
    import { dashboardState } from '../../../pages/dashboard/stores/DashboardState.ts';

    import Button from '../../../components/ui/Button.svelte';
    import Hamburger from '../../icons/Hamburger.svelte';
    import Logout from '../../icons/Logout.svelte';

    import { ButtonType, IconColor } from '../../../components/types.ts';
    import type { Office } from '../../../../../model/src/office.ts';
    import type { User } from '../../../../../model/src/user.ts';

    export let open = false;
    export let user: User;

    export let currName: Office['name'] | null = null;
    $: if (selectedOffice !== null) currName = $allOffices[selectedOffice] ?? null;

    let selectedOffice: Office['id'] | null = null;
    $: if ($dashboardState.currentOffice !== null) selectedOffice = $dashboardState.currentOffice;
</script>

<nav id="navcontainer" on:click|stopPropagation on:keypress>
    <span id="leftbar">
        {#if typeof user !== 'undefined'} 
            <span id="icon"><Hamburger bind:open on:click={() => (open = !open)} /></span>
        {/if}
        <p>{$currentPage} ({currName})</p>
        <slot></slot>
    </span>
    <span id="middle-logo">DocTrack</span>
    <nav id="profilenav">
        {#if typeof user !== 'undefined'} 
            <span>{user.name}</span>
            <span><img src={user.picture} alt="Profile Picture for {user.name}" /></span>
        {:else}
            <a href="/">
                <Button type={ButtonType.Primary}>
                    <Logout color={IconColor.White} alt="Return to the main Login screen" /> Back to Main Page
                </Button>
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
