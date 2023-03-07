<script lang="ts">
    import { register } from '../register.ts';
    import { Session } from '../../api/session.ts';
</script>
<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        {#await Session.getUser()}
            Getting user...
        {:then user}
            Hello, {user.name}!
        {/await}
    {/await}
</main>
