<script lang="ts">
    import type { User } from '../../../../../model/src/user.ts';

    import Hamburger from '../../icons/Hamburger.svelte';

    export let show = false;
    export let user: User;

</script>

<nav id="navcontainer" on:click|stopPropagation on:keypress>
    <span id="icon"><Hamburger bind:open={show} on:click={() => {show = !show;}} /></span>
    <p class="doctrack">DocTrack</p>
    <nav id="profilenav">
        <span class="unselectable">{user.name} </span>
        <span><img class="unselectable" src={user.picture} alt="{user.name[0]}" /></span>
    </nav>

</nav>

<style>
    @import url('../../../pages/vars.css');

    .doctrack {
        user-select: none;
        font-size: var(--large);
        font-weight: bold;

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
        box-shadow: 0 1px var(--spacing-normal) var(--shadow-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-small);
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


    .unselectable {
        user-select: none;
    }
    
</style>
