<script lang="ts">
    import './icon-styles.css'
    import { IconColor} from '../types.ts';
    
    export let color: IconColor = IconColor.Default;
    export let width: string = '1rem';
    export let alt:string = '';
    export let height: string = '1rem';

    /**Replace the next lines to generate an icon.*/
	const iconUrl = new URL("../../assets/send-alt.svg", import.meta.url);
</script>

<img class="{color}" {width} {height} {alt} src="{iconUrl.pathname}" on:click on:keydown/>
