<script lang="ts">
    export let err = null as Error | null;
</script>

<div>
    <h2>Sorry, this page isn't available.</h2>
    <p>The link is currently unavailable or you may be offline. <a href="/auth/login">Log back in?</a></p>
    {#if err !== null}
        <p>Technical Details: ({err.name}) {err.message}</p>
    {/if}
</div>

<style>
    div {
        text-align: center;
    }
</style>
