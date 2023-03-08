<script>
    import Button from '../components/ui/Button.svelte';

    import { register } from './register.ts';
    import { ButtonType } from '../components/types.ts';
</script>

<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        <div>
            <a href="/auth/login"><Button type={ButtonType.Primary}>Login with Google</Button></a>
        </div>
    {/await}
</main>

<style>
    div {
        text-align: center;
    }
</style>
