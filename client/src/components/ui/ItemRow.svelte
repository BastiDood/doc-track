<script lang='ts'>
    import Icons from "./Icons.svelte";
    import { IconColor } from "../types.ts";
    
    export let type: "default" | "outbox" | "inbox" | "person" | "invite";
    export let iconName: string;
    let showActionIcons: boolean = false;

</script>

<div class="parentContainer" on:mouseenter={()=>{showActionIcons = true}} on:focus={()=>{showActionIcons = true}} on:mouseleave={()=>showActionIcons = false}>
    <div class="itemIcon">
        <Icons name={iconName} color={IconColor.Primary}/>
    </div>
    <div class="itemText">
        <slot>
            Default slot Text.
        </slot>
    </div>
    <div class="actionIcon">
        {#if (!showActionIcons)}

            <Icons name="threedots-vertical"/>

        {:else if (type === "outbox")}
            <Icons name="send-paperplane"/>
            <Icons name="terminate-box"/>
            <Icons name="threedots-vertical"/>
        {/if}
    </div>
</div>

<style>
    .parentContainer {
        display: flex;
        border-style: solid;
    }
    .itemIcon {
        flex: 1 1 10%;
    }
    .itemText {
        flex: 8 1 70%;
    }
    .actionIcon {
        display: inline-flex;
        justify-content: flex-end;
        flex: 3 2 20%;
    }
</style>
