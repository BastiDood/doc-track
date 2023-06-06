<script lang="ts">
    import './../../components/icons/icon-styles.css';

    export let alt: string;
    let isWinked = false as boolean;

    const iconUrl = new URL('../../assets/icons/doctrack.svg', import.meta.url);
    const iconUrlWinked = new URL('../../assets/icons/doctrack-wink.svg', import.meta.url);

    function enableWinked() {
        isWinked = true;
    }
</script>

<article on:mouseenter={enableWinked} on:mouseleave={enableWinked}>
    <img {alt} src={isWinked ? iconUrlWinked.pathname : iconUrl.pathname} on:click on:keydown />
</article>

<style>
    article {
        cursor: pointer;
    }

    img {
        height: 2rem;
    }
</style>
