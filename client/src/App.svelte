<script>
    import { register } from './register';
    const promise = register();
</script>

<main>
    {#await promise}
        Loading...
    {:then}
        Hello world!
    {:catch err}
        {err}
    {/await}
</main>
