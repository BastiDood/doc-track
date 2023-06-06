<script lang="ts">
    let isWinked = false as boolean;

    const iconUrl = new URL('../../assets/logo/doctrack.svg', import.meta.url);
    const iconUrl_winked = new URL('../../assets/logo/doctrack-wink.svg', import.meta.url);
</script>

<span on:mouseenter={ () => { isWinked = true; } } on:mouseleave={ () => { isWinked = false; } }>
    <img alt="Doctrack logo" src={isWinked ? iconUrl_winked.pathname : iconUrl.pathname} on:click on:keydown />
</span>

<style>
    span {
        cursor: pointer;
    }
</style>
