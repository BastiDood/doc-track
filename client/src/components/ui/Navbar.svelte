<script lang="ts">
    import { Session } from '../../api/session.ts';

    import Button from '../../components/ui/Button.svelte';
    import Logout from '../../components/icons/Logout.svelte';

    import { ButtonType } from '../../components/types.ts';

    const contents = [
        {
            text: 'Logout',
            redirect: '/',
        },
        {
            text: 'Dashboard',
            redirect: '/dashboard',
        },
        {
            text: 'Profile',
            redirect: '/',
        },
    ];
</script>

<nav>
    <p>
        {#await Session.getUser()}
            Hello!
        {:then user}
            Hello, {user.name}!
        {/await}
    </p>
    <div class="links">
        {#each contents as content}
            <a href={content.redirect}>{content.text}</a>
        {/each}
    </div>
</nav>

<style>
    nav {
        display: flex;
        background-color: blueviolet;
        justify-content: space-between;
        padding: 0.5rem;
        position: sticky;
    }

    p {
        margin: 0;
    }

    .links {
        display: flex;
        gap: 0.5rem;
    }

    .links > a {
        display: inline-block;
    }

    .links > a:hover {
        background-color: blue;
    }
</style>
