<script>
    import Router from 'svelte-spa-router';

    import { currentPage } from './stores/CurrentPage.ts';
    import { currentUser } from './stores/UserStore.ts';

    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import SideDrawer from '../../components/ui/navigationbar/SideDrawer.svelte';

    import routes from './views/index.ts';
    import { register } from '../register.ts';

    let toggleDrawer = false;
</script>

<svelte:head>
    <title>{$currentPage}</title>
</svelte:head>

{#await currentUser.load()}
    <p>Loading user...</p>
{:then user}
    {#if user === null}
        <span>No user available...</span>
    {:else}
        <TopBar {user} bind:open={toggleDrawer} />
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
    {/if}
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
