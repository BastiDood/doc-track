<script lang="ts">
    import './../../components/icons/icon-styles.css';

    export let alt: string;
    export let mini = false as boolean;

    const iconUrl = new URL('../../assets/icons/doctrack.svg', import.meta.url);
</script>

<img {alt} class:mini src={iconUrl.pathname} on:click on:keydown />

<style>
    .mini {
        height: 2rem;
    }
</style>
