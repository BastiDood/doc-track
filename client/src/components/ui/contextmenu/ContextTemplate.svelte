<script lang="ts">
    export let show = false;
</script>

<div class="drawer" class:show={show}>
    <slot></slot>
</div>

<style>
    @import url('../../../pages/vars.css');

    div {
        width: 100vw;
        border: var(--spacing-tiny) solid black;
        transition: bottom var(--animation-length);
        bottom: -100%;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        display: block;
        position: fixed;
        background-color: white;
        z-index: 100;
    }

    .show {
        bottom: 0;
    }
</style>
