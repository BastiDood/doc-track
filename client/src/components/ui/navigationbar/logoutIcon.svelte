<script lang="ts">
    import type { User } from '../../../../../model/src/user.ts';

    // eslint-disable-next-line no-undefined
    export let picture = undefined as User['picture'] | undefined;
    let isLogoutHovered = false as boolean;
    const logoutIcon = new URL('../../../assets/icons/carbon/logout-profile.svg', import.meta.url);
</script>

{#if typeof picture === 'undefined'}
    <img id="user" src={logoutIcon.pathname} alt="Profile" />
{:else}
    <a href="/" on:mouseenter={ () => { isLogoutHovered = true; } } on:mouseleave={ () => { isLogoutHovered = false; } }>
        <img id="user" src={isLogoutHovered ? logoutIcon.pathname : picture} alt="Changing" />
    </a>
{/if}

<style>
#user {
    border-radius: 50%;
    display: block;
    height: 2rem;
    user-select: none;
}
</style>
