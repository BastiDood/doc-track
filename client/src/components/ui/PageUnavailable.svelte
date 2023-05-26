<script lang="ts">
    import { InvalidSession } from '../../api/error';

    export let err = null as Error | null;
</script>

<div>
    <h2>Sorry, this page isn't available.</h2>
    {#if err !== null}
        {#if err instanceof InvalidSession}
            <p>Your session has expired. <a href="/auth/login">Log back in?</a></p>
        {:else}
            <p>Technical Details: ({err.name}) {err.message}</p>
        {/if}
    {/if}
</div>

<style>
    div {
        text-align: center;
    }
</style>
