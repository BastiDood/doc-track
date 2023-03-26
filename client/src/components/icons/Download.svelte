<script lang="ts">
    import './icon-styles.css';
    import { IconColor, IconSize } from '../types.ts';
    
    export let color: IconColor = IconColor.Default;
    export let size: IconSize = IconSize.Normal;
    export let alt: string;

    // Replace the next lines to generate an icon.
	const iconUrl = new URL('../../assets/icons/download.svg', import.meta.url);
</script>

<img class="{color} {size}" {alt} src="{iconUrl.pathname}" on:click on:keydown />