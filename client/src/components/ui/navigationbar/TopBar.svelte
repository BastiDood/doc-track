<script lang="ts">
    import { dashboardState } from '../../../pages/dashboard/stores/DashboardState.ts';
    import { location } from 'svelte-spa-router';

    import type { User } from '../../../../../model/src/user.ts';

    import Hamburger from '../../icons/Hamburger.svelte';

    export let show = false;
    export let user: User;
    export let currentPage: string;
</script>

<nav id="navcontainer" on:click|stopPropagation on:keypress>
    <nav id="leftbar">
        <span id="icon"><Hamburger bind:open={show} on:click={() => (show = !show)} /></span>
        <p>{currentPage}</p>   
    </nav>
    <p>DocTrack</p>
    <nav id="profilenav">
        <span>{user.name}</span>
        <span><img src={user.picture} alt="{user.name[0]}" /></span>
    </nav>
</nav>

<style>
    @import url('../../../pages/vars.css');

    p {
        font-size: var(--large);
        font-weight: bold;
        color: white;
    }

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
