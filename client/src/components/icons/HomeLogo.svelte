<script lang="ts">
    import './../../components/icons/icon-styles.css';

    export let alt: string;

    const iconUrl = new URL('../../assets/icons/doctrack.svg', import.meta.url);
</script>

<img {alt} src={iconUrl.pathname} on:click on:keydown />

<style>
    img { 
        user-select: none;
    }
</style>