<script lang="ts">
    import Router, { push, pop, replace } from 'svelte-spa-router';

    import { register } from '../register.ts';
    import { Session } from '../../api/session.ts';
    import Navbar from '../../components/ui/Navbar.svelte';
    import Button from '../../components/ui/Button.svelte'

    import routes from './routes.ts';
</script>
<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        <Navbar />
        <!-- Sample navigation of pages. Implement in drawer
        <Button on:click={() => push('/inbox')}>Inbox</Button>
        <Button on:click={() => push('/outbox')}>Outbox</Button>
        -->
        <Router {routes} />
    {/await}
</main>
