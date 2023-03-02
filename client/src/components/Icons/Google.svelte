<script lang="ts">
    import './icon-styles.css';
    import { IconColor, IconSize } from '../types.ts';
    
    export let color: IconColor = IconColor.Default;
    export let width: string = IconSize.Normal;
    export let alt:string = '';
    export let height: string = IconSize.Normal;

    // Replace the next lines to generate an icon.
	const iconUrl = new URL("../../assets/google.svg", import.meta.url);
</script>

<img class="{color}" {width} {height} {alt} src="{iconUrl.pathname}" on:click on:keydown/>
