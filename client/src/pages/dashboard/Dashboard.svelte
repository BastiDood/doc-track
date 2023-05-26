<script lang="ts">
    import Router from 'svelte-spa-router';
    import { assert } from '../../assert.ts';

    import { currentPage } from '../../stores/CurrentPage.ts';
    import { dashboardState } from '../../stores/DashboardState.ts';
    import { allOffices } from '../../stores/OfficeStore.ts';
    import { currentUser } from '../../stores/UserStore.ts';
    import { deferredSnaps } from '../../stores/DeferredStore.ts';
    import { topToastMessage } from '../../stores/ToastStore.ts';

    import Toast from '../../components/ui/Toast.svelte';
    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import SideDrawer from '../../components/ui/navigationbar/SideDrawer.svelte';
    import { ToastType } from '../../components/types.ts';

    import routes from './views/index.ts';
    import { register } from '../register.ts';
    import PageUnavailable from '../../components/ui/PageUnavailable.svelte';

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
        topToastMessage.enqueue({
            type: ToastType.Info,
            title: 'No office selected',
            body: 'Please select an office to continue.',
        });
    
    const reg = register().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });

    const sessionReady = currentUser.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });
</script>

<svelte:head>
    <title>{pageName} - {officeName}</title>
</svelte:head>

<svelte:window on:message={onSync} />

{#await Promise.all([reg, sessionReady])}
    <p>Loading user and service Worker...</p>
{:then} 
    {#if $currentUser !== null}
        <TopBar user={$currentUser} bind:open={toggleDrawer} />
    {/if}
    <main on:click={() => (toggleDrawer &&= false)} on:keydown>
        <SideDrawer show={toggleDrawer} />
        <section>
            <Router {routes} />
        </section>
    </main>
    <Toast />
{:catch err}
    <PageUnavailable {err} />
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
