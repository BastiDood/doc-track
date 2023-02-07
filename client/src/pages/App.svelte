<script>
    import { register } from './register';
    const ready = register();
</script>

<main>
    {#await ready}
        Waiting for service worker...
    {:then}
        Hello world!
    {/await}
</main>
