<script>
    import Router from 'svelte-spa-router';

    import { currentUser } from './stores/UserStore.ts';

    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import SideDrawer from '../../components/ui/navigationbar/SideDrawer.svelte';

    import routes from './views/index.ts';
    import { register } from '../register.ts';

    let toggleDrawer = false;
    let selectedTab = "Inbox";
    let selectedId = 1;

</script>

<svelte:head>
    <link rel="stylesheet" href="/css/dashboard.css" />
    <title>{selectedId}</title>
</svelte:head>

<main on:click={() => (toggleDrawer &&= false)} on:keydown>
    {#await register()}
        Waiting for service worker...
    {:then}
        {#await currentUser.load()}
            Loading user...
        {:then user}
            <TopBar {user} bind:show={toggleDrawer} bind:selectedId={selectedId} />
            <section>
                <SideDrawer show={toggleDrawer} bind:selected={selectedTab} />
                <Router {routes} />
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

    section {
        height: 100%;
        position: relative;
        position:flex;
    }
</style>
