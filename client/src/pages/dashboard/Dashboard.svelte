<script>
    import Router from 'svelte-spa-router';

    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import SideDrawer from '../../components/ui/navigationbar/SideDrawer.svelte';

    import routes from './views/index.ts';
    import { register } from '../register.ts';
    import { Session } from '../../api/session.ts';

    let toggleDrawer = false;

</script>

<main on:click = {() => {if (toggleDrawer) toggleDrawer = false }} on:keydown>
    {#await register()}
        Waiting for service worker...
    {:then}
        {#await Session.getUser()}
            Loading user...
        {:then user}
            <div on:click|stopPropagation on:keypress>
                <TopBar {user} bind:show={toggleDrawer}/>
            </div>
            <section>
                <div on:click|stopPropagation on:keypress>
                <SideDrawer show={toggleDrawer} />
                </div>
                <Router {routes} />
            </section>
        {/await}
    {/await}
</main>

<style>
    @import url('../global.css');
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
