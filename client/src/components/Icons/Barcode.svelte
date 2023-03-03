<script lang="ts">
    import './icon-styles.css';
    import { IconColor, IconSize } from '../types.ts';
    
    export let color = IconColor.Default;
    export let width = IconSize.Normal;
    export let alt = '';
    export let height = IconSize.Normal;

    // Replace the next lines to generate an icon.
	const iconUrl = new URL('../../assets/barcode.svg', import.meta.url);
</script>

<img class="{color}" {width} {height} {alt} src="{iconUrl.pathname}" on:click on:keydown />