<script lang="ts">
    import Router, { push, pop, replace } from 'svelte-spa-router';

    import { register } from '../register.ts';
    import { Session } from '../../api/session.ts';
    import Navbar from '../../components/ui/navigationbar/Navbar.svelte';
    import Button from '../../components/ui/Button.svelte';

    import routes from './routes.ts';
    import Sidebar from '../../components/ui/navigationbar/NavDrawer.svelte';

    let toggleDrawer = false;

    // TODO: Updates based on permissions
    let navItems = [
        { label: "Inbox", href: "inbox", key:'I' },
        { label: "Outbox", href: "outbox", key:'O' },
        { label: "Drafts", href: "drafts", key:'D' },
        { label: "Barcodes", href: "barcodes", key:'B' },
        { label: "Metrics", href: "metrics", key:'M' },
        { label: "Manage Invites", href: "manage-invites", key:'N' },
        { label: "Manage Staff", href: "manage-staff", key:'S' },
        { label: "Manage Administrators", href: "manage-administrators", key:'A' },
        { label: "Manage Global Settings", href: "manage-global-settings", key:'G' }, 
    ];

</script>
    {#await register()}
        Waiting for service worker...
    {:then}
        <main>
            <Navbar bind:showBar={toggleDrawer} bind:navItems={navItems} />
            <Sidebar bind:show={toggleDrawer} bind:navItems={navItems} />
        </main>
    {/await}

