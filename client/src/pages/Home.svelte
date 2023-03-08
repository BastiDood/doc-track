<script>
    import { register } from './register.ts';
    import Add from '../components/icons/Add.svelte'
    import { IconSize } from '../components/types.ts'
</script>

<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        <Add size={IconSize.Normal}/>
    {/await}
</main>
