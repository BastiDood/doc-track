<script lang="ts">
    import './../icons/icon-styles.css';
    import { IconColor, IconSize } from './../types.ts';
    
    export let color: IconColor = IconColor.Default;
    export let size: IconSize = IconSize.Large;
    export let alt: string;

    // Replace the next lines to generate an icon.
    const iconUrl = new URL('../../assets/icons/LogoMain.svg', import.meta.url);
</script>

<img id="logo" {alt} src="{iconUrl.pathname}" on:click on:keydown />


<style>
    #logo {
        width: 100%;
        height: 100%;
    }
</style>