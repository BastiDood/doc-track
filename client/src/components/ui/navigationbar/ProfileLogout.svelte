<script lang="ts">
    import type { User } from '../../../../../model/src/user.ts';
    import Logout from '../../icons/Logout.svelte';
    
    export let picture: User['picture'] | undefined;
    
    let isLogoutHovered = false as boolean;
</script>

<a href="/" on:mouseenter={() => (isLogoutHovered = true)} on:mouseleave={() => (isLogoutHovered = false)}>
    {#if typeof picture === 'undefined'}
        <Logout alt="Log-out user"/>
    {:else}
        {#if isLogoutHovered}
            <Logout alt="Log-out user"/>
        {:else}
            <img src={picture} alt="Username" />
        {/if}
    {/if}
</a>


<style>
    img {
        border-radius: 50%;
        display: block;
        height: 2rem;
    }
</style>
