<script lang="ts">
    export let alt: string;

    // Replace the next lines to generate an icon.
    const iconUrl = new URL('../../assets/logo/doctrack-wink.svg', import.meta.url);
</script>

<img {alt} src="{iconUrl.pathname}" on:click on:keydown />

<style>
    img {
        height: 2rem;
    }
</style>
