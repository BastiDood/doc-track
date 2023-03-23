<script lang="ts">
    import './icon-styles.css';
    import { IconColor, IconSize } from '../types.ts';
    
    export let color = IconColor.Default;
    export let size = IconSize.Normal;
    export let alt = '';

    // Replace the next lines to generate an icon.
	const iconUrl = new URL('../../assets/icons/menu.svg', import.meta.url);
</script>

<img class="{color} {size}" {alt} src="{iconUrl.pathname}" on:click on:keydown />