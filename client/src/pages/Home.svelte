<script>
    import { register } from './register.ts';
</script>

<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        Hello world!
    {/await}
</main>
