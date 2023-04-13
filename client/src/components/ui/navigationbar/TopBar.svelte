<script lang="ts">
    import type { User } from '../../../../../model/src/user.ts';

    import Hamburger from '../../icons/Hamburger.svelte';

    export let show = false;
    export let user: User;
</script>

<nav id="mainnav" on:click|stopPropagation on:keypress>
    <div>
        <span id="icon"><Hamburger bind:open={show} on:click={() => {show = !show}} /></span>
        
    </div>
    <nav id="profilenav">
        <span class="unselectable">{user.name} </span>
        <span><img class="unselectable" src={user.picture} alt="{user.name}" /></span>
    </nav>
    
</nav>

<style>
    @import url('../../../pages/vars.css');

    #mainnav {
        align-content: center;
        background-color: var(--primary-color);
        box-shadow: 0 1px var(--spacing-normal) var(--shadow-color);
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-small);
    }
    #profilenav {
        align-content: center;
        background-color: var(--primary-color);
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: var(--spacing-small);
    }


    #icon {
        cursor: pointer;
    }

    .unselectable {
        user-select: none;
    }

    img {
        border-radius: 50%;
        display: block;
        height: 2rem;
    }
</style>
