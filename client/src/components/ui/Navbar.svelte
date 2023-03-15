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
    @import url('../../pages/vars.css');

    nav {
        display: flex;
        background-color: var(--secondary-color);
        justify-content: space-between;
        padding: var(--spacing-small);
        position: sticky;
    }

    p {
        margin: 0;
    }
</style>
