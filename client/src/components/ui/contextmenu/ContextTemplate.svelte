<script lang="ts">
    export let show = false;
</script>

<div class="drawer" class:hidden={!show}>

</div>

<style>
    @import url('../../../pages/vars.css');


    div {
        width: 100vw;
        border: var(--spacing-tiny) solid black;
        transition: bottom var(--animation-length);
        bottom: 0;
        border-radius: var(--border-radius) var(--border-radius);
    }
    .hidden {
        bottom: -100%;
    }

</style>



