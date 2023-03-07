<script>
    import { register } from './register.ts';
    const ready = register();
</script>

<main>
    {#await ready}
        Waiting for service worker...
    {:then}
        Hello world!
    {/await}
</main>
