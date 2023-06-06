<script lang="ts">
    export let alt: string;

    // Replace the next lines to generate an icon.
    const techstackIcon = new URL('../assets/techstack.svg', import.meta.url);
</script>

<a href="https://github.com/BastiDood/doc-track">
    <p>© 2023 Doctrack. All rights reserved.</p>
    <p>Powered by:</p>
    <img {alt} src="{techstackIcon.pathname}" on:click on:keydown />
</a>