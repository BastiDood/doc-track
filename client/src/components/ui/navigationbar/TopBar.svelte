<script lang="ts">
    import Button from '../../../components/ui/Button.svelte';
    import Hamburger from '../../icons/Hamburger.svelte';
    import Logout from '../../icons/Logout.svelte';

    import { ButtonType, IconColor } from '../../../components/types.ts';
    import type { User } from '../../../../../model/src/user.ts';
    import { dashboardState } from '../../../pages/dashboard/stores/DashboardState.ts';
    import { allOffices } from '../../../pages/dashboard/stores/OfficeStore.ts';
    import { isOnline } from '../../../pages/dashboard/stores/NetState.ts';

    export let nodrawer = false;
    export let open = false;
    export let user: User;

    $: maybeOfficeName = $dashboardState.currentOffice === null
        ? null
        : $allOffices[$dashboardState.currentOffice];
    $: officeName = maybeOfficeName ?? '';
</script>

<nav class:offline={!$isOnline} id="navcontainer" on:click|stopPropagation on:keypress>
    <span id="icon">
        {#if !nodrawer}
            <Hamburger bind:open on:click={() => (open = !open)} /> 
        {/if}
        <span class:offline={!$isOnline} id="title">DocTrack</span>
        {#if officeName}
            <span> - {officeName}</span>
        {/if}
    </span>
    <nav id="profilenav">
        {#if typeof user === 'undefined'} 
            <a href="/">
                <Button type={ButtonType.Primary}>
                    <Logout color={IconColor.White} alt="Return to the main Login screen" /> Back to Main Page
                </Button>
            </a>
        {:else}
            <span>{user.name}</span>
            <span><img src={user.picture} alt="Profile Picture for {user.name}" /></span>
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
        display: flex;
        align-items: center;
        gap: var(--spacing-small);
    }

    img {
        border-radius: 50%;
        display: block;
        height: 2rem;
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

    #navcontainer.offline {
        background-color: var(--offline-color);
    }

    #title.offline::after {
        content: ' *';
    }

    #profilenav {
        align-content: center;
        background-color: inherit;
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-small);
        align-items: center;
        padding: var(--spacing-small);
    }
</style>
