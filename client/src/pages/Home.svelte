<script>
    import { register } from './register.ts';
    import Button from '../components/ui/Button.svelte';
    import { ButtonType } from '../components/types.ts';
    const ready = register();
</script>

<main>
    {#await ready}
        Waiting for service worker...
    {:then}
        <div style="text-align: center">
            <a href="/auth/login"><Button type={ButtonType.Primary}>Login with Google</Button></a>
        </div>
    {/await}
    
    
</main>
