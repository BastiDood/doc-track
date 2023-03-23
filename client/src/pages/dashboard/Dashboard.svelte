<script>
    import Router from 'svelte-spa-router';

    import Navbar from '../../components/ui/navigationbar/Navbar.svelte';
    import NavDrawer from '../../components/ui/navigationbar/NavDrawer.svelte';

    import routes from './views/index.ts';
    import { register } from '../register.ts';

    let toggleDrawer = false;
</script>

<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        <Navbar bind:show={toggleDrawer} />
        <section>
            <NavDrawer show={toggleDrawer} />
            <Router {routes} />
        </section>
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
