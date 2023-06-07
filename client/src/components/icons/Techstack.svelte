<script lang="ts">
    export let alt: string;

    // Replace the next lines to generate an icon.
    const techstackIcon = new URL('../../assets/techstack.svg', import.meta.url);
</script>

<img {alt} src="{techstackIcon.pathname}" on:click on:keydown />
