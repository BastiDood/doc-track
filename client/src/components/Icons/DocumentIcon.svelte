<script lang="ts">
    import "./icon-styles.css"
    import { IconColor} from "../types.ts";
    
    export let color: IconColor = IconColor.Default;
    export let width: string = "1rem";
    export let height: string = "1rem";

    const iconUrl = new URL("../../assets/document-blank.svg", import.meta.url);

</script>

<img class="{color}" {width} {height} src="{iconUrl.pathname}" alt="{name}"/>
