<script lang="ts">
    import { InvalidSession } from '../../api/error';
    import DoctrackAngry from '../doctrack/DoctrackAngry.svelte';

    export let err = null as Error | null;
</script>

<div>
    <div id="doctrack-logo">
        <DoctrackAngry />
    </div>
    <h2>Well... this is awkward.</h2>
    <h3>Mr. DocTrack wasn't happy with what you did.</h3>
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

    #doctrack-logo {
        display: block;
        margin: 0 auto;
        max-width: 50svw;
    }
</style>
