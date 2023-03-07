<script lang="ts">
    import { register } from '../register.ts';
    import { Session } from '../../api/session.ts';
    const ready = register();
</script>
<main>
    {#await ready}
        Waiting for service worker...
    {:then}
        {#await Session.getUser()}
            Getting user...
        {:then user}
            Hello, {user.name}!
        {/await}
    {/await}
</main>
