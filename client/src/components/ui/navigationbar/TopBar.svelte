<script lang="ts">
    import { dashboardState } from '../../../pages/dashboard/stores/DashboardState.ts';
    import { location } from 'svelte-spa-router';

    import type { User } from '../../../../../model/src/user.ts';

    import Hamburger from '../../icons/Hamburger.svelte';

    export let show = false;
    export let user: User;
    let selectedOffice: Office['id'] | null = null;
    let currentPage = 'Dashboard';
    $: currentPage = `${$location.charAt(1).toUpperCase()}${$location.slice(2)}`;

    $: if (selectedOffice !== null ) dashboardState.setOffice(selectedOffice);
</script>

<nav id="navcontainer" on:click|stopPropagation on:keypress>
    <span id="leftbar">
        {#if user !== undefined}
            <span id="icon"><Hamburger bind:open={show} on:click={() => (show = !show)} /></span>
        {/if}
        <p>{currentPage}</p>
        <slot></slot>
        </span>
    <p>DocTrack</p>
    <nav id="profilenav">
        {#if user !== undefined}
            <span>{user.name}</span>
            <span><img src={user.picture} alt="{user.name[0]}" /></span>
        {:else}
            <span>Guest View</span>
        {/if}
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
