<script lang="ts">
    import { iconsList, Icon } from "./Icons.ts";
    export let name: string;
    export let color: "default" | "primary" | "faded" = "default";
    export let width: string = "1rem";
    export let height: string = "1rem";

    
    let showIcon = iconsList.find((e:Icon) => e.name === name);
</script>
{#if showIcon}
    <svg class="{$$props.class} {color}" {width} {height} viewBox = "0 0 {showIcon.box} {showIcon.box}">{@html showIcon.svg}</svg>
{:else}
    {name} is not a valid icon.
{/if}

<style>
    .faded {
        filter: invert(73%) sepia(4%) saturate(555%) hue-rotate(171deg) brightness(95%) contrast(94%);
    }
    .primary {
        filter: invert(26%) sepia(77%) saturate(6805%) hue-rotate(242deg) brightness(97%) contrast(96%);
    }
    .default {
        filter: none;
    }
</style>