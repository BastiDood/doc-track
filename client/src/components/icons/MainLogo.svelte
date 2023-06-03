<script lang="ts">
    import './../../components/icons/icon-styles.css';

    export let alt: string;
    export let mini = false as boolean;
    let isWinked = false as boolean;

    const iconUrl = new URL('../../assets/icons/doctrack.svg', import.meta.url);
    const iconUrl_winked = new URL('../../assets/icons/doctrack-wink.svg', import.meta.url);
</script>

<article on:mouseenter={ () => isWinked = true } on:mouseleave={ () => isWinked = false }>
    <img {alt} class:mini src={isWinked ? iconUrl_winked.pathname : iconUrl.pathname} on:click on:keydown />
</article>

<style>
    .mini {
        height: 2rem;
    }

    article {
        cursor: pointer;
    }
</style>