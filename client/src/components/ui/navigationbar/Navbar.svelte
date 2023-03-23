<script lang="ts">
    import type { User } from '../../../../../model/src/user.ts';

    import Hamburger from '../../icons/Menu.svelte';

    export let show = false;
    export let user: User;
</script>

<nav>
    <div>
        <span id="icon"><Hamburger on:click={() => show = !show} /></span>
        <span>Hello, {user.name}!</span>
    </div>
    <img src={user.picture} alt="{user.name}" />
</nav>

<style>
    @import url('../../../pages/vars.css');

    nav {
        align-content: center;
        background-color: var(--primary-color);
        box-shadow: 0 1px var(--spacing-normal) var(--shadow-color);
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-small);
    }

    #icon {
        cursor: pointer;
    }

    img {
        border-radius: 50%;
        display: block;
        height: 1.25rem;
    }
</style>
