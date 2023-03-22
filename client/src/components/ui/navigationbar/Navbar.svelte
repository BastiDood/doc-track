<script lang="ts">
    import { Session } from '../../../api/session.ts';
    import NavQuery from './NavQuery.svelte';
    import NavPicture from './NavPicture.svelte';

    import Button from '../Button.svelte';
    import Logout from '../../icons/Logout.svelte';
    import Hamburger from '../../icons/Eye.svelte';

    import { ButtonType } from '../../../components/types.ts';

    

    import Router, { push, pop, replace } from 'svelte-spa-router';
    import routes from '../../../pages/dashboard/routes.ts';

    // Mobile stuff 
    import Sidebar from './NavDrawer.svelte';
    export let showBar : boolean;

    // TODO: Updates based on permissions
    export let navItems;

    function logout() {
        const form = document.createElement('form');
        form.method = 'post';
        form.action = "/auth/logout";

        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';

        form.appendChild(hiddenField);
        document.body.appendChild(form);
        form.submit();
    }


</script>

<NavQuery query="(max-width: 1024px)" let:matches>

    
<nav class="navelements{matches ? ' mobile' : ''}">
    {#await Session.getUser()}
        Getting user info...
    {:then user}
        <div class={`mobile-icon${matches ? "" : " hidden"}`}>
            <Button type={ButtonType.Primary} on:click={() => showBar = !showBar}>
                <Hamburger />
            </Button>
        </div>

        {#each navItems as item} 
            <div><button class={`navitem${matches ? " hidden" : ""}`} on:click={() => push(`/${item.href}`)}>{item.label}</button></div>
        {/each}
        <div><button class={`navitem${matches ? " hidden" : ""}`} on:click={() => logout()}><Logout /></button></div>
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
        cursor: pointer;
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

    .mobile-icon {
        top: 0;
        left: 0;
        position: fixed;
    }

    .hidden {
        display: none;
    }
</style>
