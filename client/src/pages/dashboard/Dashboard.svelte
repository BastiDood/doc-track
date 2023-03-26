<script>
    import Router from 'svelte-spa-router';

    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import SideDrawer from '../../components/ui/navigationbar/SideDrawer.svelte';

    import routes from './views/index.ts';
    import { register } from '../register.ts';
    import { Session } from '../../api/session.ts';

    let toggleDrawer = false;

</script>

<main on:click={() => toggleDrawer &&= false} on:keydown>
    {#await register()}
        Waiting for service worker...
    {:then}
        {#await Session.getUser()}
            Loading user...
        {:then user}
            <TopBar {user} bind:show={toggleDrawer} />
            <section>
                <SideDrawer show={toggleDrawer} />
                <Router {routes} />
            </section>
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
    }
</style>
