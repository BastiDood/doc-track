<script lang="ts">
    import { Session } from '../../../api/session.ts';
    import Hamburger from '../../icons/Menu.svelte';

    export let show = false;
</script>

<nav>
    <span id="icon">
        <Hamburger on:click={() => show = !show} />
    </span>
    <span>
        {#await Session.getUser()}
            Hello!
            {:then user}
            Hello, {user.name}!
        {/await}
    </span>
</nav>

<style>
    @import url('../../../pages/vars.css');

    nav {
        background-color: var(--secondary-color);
        box-shadow: 0 1px 8px #ddd;
        padding: var(--spacing-small);
    }

    #icon {
        cursor: pointer;
    }
</style>
