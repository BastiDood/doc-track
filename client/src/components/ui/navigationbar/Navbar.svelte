<script lang="ts">
    import { Session } from '../../../api/session.ts';
    import NavQuery from './NavQuery.svelte';
    import NavPicture from './NavPicture.svelte';

    import Button from '../Button.svelte';
    import Logout from '../../icons/Logout.svelte';

    import { ButtonType } from '../../../components/types.ts';

    

    import Router, { push, pop, replace } from 'svelte-spa-router';
    import routes from '../../../pages/dashboard/routes.ts';

    let mobile = false;

    // TODO: Updates based on permissions
    const navItems = [
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

<NavQuery query="(max-width: 1024px)" let:matches>
<nav class="navelements{matches ? ' mobile' : ''}">
    {#await Session.getUser()}
        Hello!
    {:then user}
    
        {#each navItems as item} 
            <div><button class="navitem" on:click={() => push(`/${item.href}`)}>{item.label}</button></div>
        {/each}
        <form method="POST" action="/auth/logout" class="navitem">
            <input type="submit" value="Logout" />
        </form>
        <NavPicture name={user.name} email={user.email}  />
    {/await}
</nav>
<Router {routes} />
</NavQuery>

<style>
    nav {
        background-color: var(--secondary-color);
        box-shadow: 0 1px 8px #ddd;
        padding: var(--spacing-small);
        justify-content: space-evenly;
        position: sticky;
    }

    button {
        padding: 0;
        border: 0;
        outline: 0;
        background-color: transparent;
    }

    .navelements {
        display: flex;
        flex-direction: row-reverse;
        flex-flow: row wrap;
        justify-content: flex-end;
        list-style-type: none;
    }
    
    .navitem {
        list-style: none;
        padding: 1em;
        height: 50pt;
        background: none;
        text-decoration: none;
        user-select: none;
        color: var(--primary-color);
        display: inline-block;
    }

    .navitem:hover {
        background-color: var(--danger-color);
        transition: all 0.3s ease 0s;
    }
    
    
    .mobile {
        background-color: green;
    }
</style>
