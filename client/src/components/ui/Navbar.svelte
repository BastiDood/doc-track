<script lang="ts">
    import { Session } from '../../api/session.ts';
    import NavQuery from "./NavQuery.svelte";

    import Button from '../../components/ui/Button.svelte';
    import Logout from '../../components/icons/Logout.svelte';

    import { ButtonType } from '../../components/types.ts';

    import Router, { push, pop, replace } from 'svelte-spa-router';
    import routes from '../../pages/dashboard/routes.ts';

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
<NavQuery query="(max-width: 768px)" let:matches>
<nav class="navelements{matches ? ' mobile' : ''}">
    <p class="profile">
        {#await Session.getUser()}
            Hello!
        {:then user}
            Hello, {user.name}! {matches ? `(Mobile)` : `(Desktop)`}
        {/await}
    </p>
        {#each navItems as item} 
            <div><button class="navitem" on:click={() => push(`/${item.href}`)}>{item.label}</button></div>
        {/each}
        <div><form method="POST" action="/auth/logout" class="navitem">
                <input type="submit" value="Logout" />
            </form>
        </div>
</nav>
<Router {routes} />
</NavQuery>

<style>
    nav {
        background-color: var(--secondary-color);
        box-shadow: 0 1px 8px #ddd;
        padding: var(--spacing-small);
        position: sticky;
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
        background: none;
        text-decoration: none;
        background-color: pink;
        display: inline-block;
    }

    .navitem:hover {
        background-color: blue;
        transition: all 0.3s ease 0s;
    }
    
    .mobile {
        background-color: green;
    }

    .profile {
        display: inline-block;
        size: 20%;
        margin: 0;
    }
</style>
