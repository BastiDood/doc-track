<script lang="ts">
    import { register } from '../register.ts';
    import { Session } from '../../api/session.ts';
    import Navbar from '../../components/ui/Navbar.svelte';
</script>
<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        <Navbar />
    {/await}
</main>
