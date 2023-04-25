<script lang="ts">
    import type { User } from '../../../../../model/src/user.ts';

    import Hamburger from '../../icons/Hamburger.svelte';

    export let show = false;
    export let user: User;
</script>

<nav id="navcontainer" on:click|stopPropagation on:keypress>
    <span id="icon"><Hamburger bind:open={show} on:click={() => (show = !show)} /></span>
    <p>DocTrack</p>
    <nav id="profilenav">
        <span>{user.name}</span>
        <span><img src={user.picture} alt="{user.name[0]}" /></span>
    </nav>
</nav>

<style>
    @import url('../../../pages/vars.css');

    p {
        font-size: var(--large);
        font-weight: bold;
        color: white;
    }

    span {
        color: white;
    }

    #icon {
        cursor: pointer;
    }

    img {
        border-radius: 50%;
        display: block;
        height: 2rem;
    }

    #navcontainer {
        align-content: center;
        background-color: var(--primary-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-small);
        position: sticky;
        top: 0;
        z-index: 10;
    }

    #profilenav {
        align-content: center;
        background-color: var(--primary-color);
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-small);
        align-items: center;
        padding: var(--spacing-small);
    }
</style>
