<script lang="ts">
    import "./icon-styles.css"
    import { IconColor, IconSize} from "../types.ts";
    
    export let color: IconColor = IconColor.Default;
    export let width: string = IconSize.Small;
    export let height: string = IconSize.Small;

    const iconUrl = new URL("../../assets/document-blank.svg", import.meta.url);

</script>

<img class="{color}" {width} {height} src="{iconUrl.pathname}" alt="{name}"/>
