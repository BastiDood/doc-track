<script lang="ts">
    import { Session } from '../../../api/session.ts';
    import NavPicture from './NavPicture.svelte';

    import Button from '../Button.svelte';
    import Logout from '../../icons/Logout.svelte';
    import Hamburger from '../../icons/Eye.svelte';

    import { ButtonType } from '../../../components/types.ts';

    

    import Router, { push, pop, replace } from 'svelte-spa-router';
    import routes from '../../../pages/dashboard/routes.ts';

    // Mobile stuff 
    export let showBar : boolean;

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

    
<nav class="navelements">
    <div class={`mobile-icon`}>
        <Button type={ButtonType.Primary} on:click={() => showBar = !showBar}>
            <Hamburger />
        </Button>
    </div>

    <div><button class={`navitem`} on:click={() => logout()}><Logout /></button></div>
    {#await Session.getUser()}
        <NavPicture name="Guest" email="Guest" />
    {:then user}
        <NavPicture name={user.name} email={user.email}  />
    {/await}
</nav>

<Router {routes} />

<style>
    @import url(../../../pages/global.css);

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
        transition: all var(--animation-length) ease 0s;
    }

    .mobile-icon {
        top: 0;
        left: 0;
        position: fixed;
        user-select: none;
    }

    .hidden {
        display: none;
    }
</style>
