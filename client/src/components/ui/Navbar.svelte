<script lang="ts">
    import { Session } from '../../api/session.ts';

    import Button from '../../components/ui/Button.svelte';
    import Logout from '../../components/icons/Logout.svelte';

    import { ButtonType } from '../../components/types.ts';
</script>

<nav>
    <p>
        {#await Session.getUser()}
            Hello!
        {:then user}
            Hello, {user.name}!
        {/await}
    </p>
    <div>
        <form method="POST" action="/auth/logout">
            <input type="submit" value="Logout" />
        </form>
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
</style>
