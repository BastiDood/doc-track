<script>
    import Router, { location } from 'svelte-spa-router';

    import { currentUser } from './stores/UserStore.ts';

    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import SideDrawer from '../../components/ui/navigationbar/SideDrawer.svelte';

    import routes from './views/index.ts';
    import { register } from '../register.ts';

    let toggleDrawer = false;
    let currentPage = 'Dashboard';
    $: currentPage = `${$location.charAt(1).toUpperCase()}${$location.slice(2)}`;
</script>

<svelte:head>
    <title>{currentPage}</title>
</svelte:head>

<main on:click={() => (toggleDrawer &&= false)} on:keydown>
    {#await register()}
        Waiting for service worker...
    {:then}
        {#await currentUser.load()}
            Loading user...
        {:then user}
            <TopBar {user} bind:show={toggleDrawer}/>
            <SideDrawer show={toggleDrawer} />
            <section class="router">
                <Router {routes}  />
            </section>
        {:catch error}
            <p>
                {error} <a href="/auth/login">Try logging in again?</a>
            </p>
        {/await}
    {/await}
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        height: 100%;
        
    }

    .router {
        overflow: scroll;
        scrollbar-width: none;
    }
    .router::-webkit-scrollbar {
        display: none; 
    }

    section {
        height: 100%;
        position: relative;
        position:flex;
    }
</style>
