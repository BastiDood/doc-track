<script lang="ts">
    import Router, { push, pop, replace } from 'svelte-spa-router';

    import { register } from '../register.ts';
    import { Session } from '../../api/session.ts';
    import Navbar from '../../components/ui/navigationbar/Navbar.svelte';
    import Button from '../../components/ui/Button.svelte';

    import routes from './routes.ts';
    import Sidebar from '../../components/ui/navigationbar/NavDrawer.svelte';

    let toggleDrawer = false;

</script>
    {#await register()}
        Waiting for service worker...
    {:then}
        <main>
            <Navbar bind:showBar={toggleDrawer} />
            <Sidebar bind:show={toggleDrawer} />
        </main>
    {/await}

