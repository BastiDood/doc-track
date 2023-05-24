<script lang="ts">
    import Router from 'svelte-spa-router';

    import { currentPage } from './stores/CurrentPage.ts';
    import { dashboardState } from './stores/DashboardState.ts';
    import { allOffices } from './stores/OfficeStore.ts';
    import { currentUser } from './stores/UserStore.ts';
    import { deferredSnaps } from './stores/DeferredStore.ts';
    import { topToastMessage } from './stores/ToastStore.ts';

    import Toast from '../../components/ui/Toast.svelte';
    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import SideDrawer from '../../components/ui/navigationbar/SideDrawer.svelte';
    import { ToastType } from '../../components/types.ts';

    import routes from './views/index.ts';
    import { register } from '../register.ts';

    let toggleDrawer = false;

    $: pageName = $currentPage || 'DocTrack';
    $: maybeOfficeName = $dashboardState.currentOffice === null
        ? null
        : $allOffices[$dashboardState.currentOffice];
    $: officeName = maybeOfficeName ?? '[No Office]';

    function onSync(evt: MessageEvent<string>) {
        deferredSnaps.onDocumentSync(evt);
    }
    
    $: if (maybeOfficeName === null && $currentPage)
        topToastMessage.enqueue({ title: 'No office selected', body: 'Please select an office to continue.', type: ToastType.Info });
</script>

<svelte:head>
    <title>{pageName} - {officeName}</title>
</svelte:head>

<svelte:window on:message={onSync} />

{#if $currentUser === null}
    <p>Loading user...</p>
{:else}
    <TopBar user={$currentUser} bind:open={toggleDrawer} />
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
    <Toast />
{/if}

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
