<script lang="ts">
    import './icon-styles.css';
    import { IconColor, IconSize } from '../types.ts';
    
    export let color: IconColor = IconColor.Default;
    export let alt: string;

    // Replace the next lines to generate an icon.
    const iconUrl = new URL('../../assets/icons/carbon/logout.svg', import.meta.url);
</script>

<img class="{color}" {alt} src="{iconUrl.pathname}" on:click on:keydown />

<style>
    img {
        border-radius: 50%;
        display: block;
        height: 2rem;
    }
</style>
