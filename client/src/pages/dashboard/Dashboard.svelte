<script>
    import Router, { location } from 'svelte-spa-router';

    import { currentUser } from './stores/UserStore.ts';

    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import SideDrawer from '../../components/ui/navigationbar/SideDrawer.svelte';

    import routes from './views/index.ts';
    import { register } from '../register.ts';

    let toggleDrawer = false;
    let currentPage = 'Dashboard';
    let currentOffice = null;
    $: currentPage = `${$location.charAt(1).toUpperCase()}${$location.slice(2)}`;
</script>

<svelte:head>
    <title>{currentPage} {currentOffice == null ? '' : `(${currentOffice})`}</title>
</svelte:head>

{#await currentUser.load()}
    <p>Loading user...</p>
{:then user}
    <TopBar {user} bind:show={toggleDrawer} bind:currentPage={currentPage} bind:currName={currentOffice} />
    <main on:click={() => (toggleDrawer &&= false)} on:keydown>
        {#await register()}
            <p>Waiting for service worker...</p>
        {:then}
            <SideDrawer show={toggleDrawer} />
            <section>
                <Router {routes} />
            </section>
        {:catch error}
            <p>{error} <a href="/auth/login">Try logging in again?</a></p>
        {/await}
    </main>
{/await}

<style>
    :global(body) {
        display: flex;
        flex-direction: column;
    }

    main {
        height: 100%;
        overflow: hidden;
        position: relative;
    }

    section {
        height: 100%;
        overflow-y: auto;
    }
</style>
