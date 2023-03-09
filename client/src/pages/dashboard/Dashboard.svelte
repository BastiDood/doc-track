<script lang="ts">
    import { register } from '../register.ts';
    import { Session } from '../../api/session.ts';
    import Navbar from '../../components/ui/Navbar.svelte';
</script>
<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        {#await Session.getUser()}
            Getting user...
        {:then user}
            <Navbar username={user.name} />

        {/await}
    {/await}
</main>

<style>
    main {
        background-color: #ffffff;
    }
</style>