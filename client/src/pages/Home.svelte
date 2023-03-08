<script>
    import { register } from './register.ts';
</script>

<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        <div style="text-align: center">
            <a href="/auth/login"><Button type={ButtonType.Primary}>Login with Google</Button></a>
        </div>
    {/await}
</main>
