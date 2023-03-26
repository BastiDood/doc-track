<script lang="ts">
    import { Events } from '../../types.ts';
    export let show = false;
    
    let context: HTMLDialogElement | null;

    $: if (context && show) context?.showModal();

    function onClose() {
        show = false;
        dispatch(Events.ContextClose)
    }
</script>

<dialog
    class:show = {show}
    bind:this = {context}
    on:close = {() => onClose()}
    on:click|self = {() => context?.close()}
    on:keydown|self = {() => context?.close()}
    >
    <div class="drawer"
        on:click|stopPropagation
        on:keydown|stopPropagation
    >
        <slot></slot>
    </div>
</dialog>

<style>
    @import url('../../../pages/global.css');

    dialog {
        width: 100vw;
        border: var(--spacing-tiny) solid black;
        bottom: -95%;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        display: block;
        position: relative;
        background-color: white;
    }

    dialog[open] {
        animation: slide-in var(--animation-length) forwards;
    }

    @keyframes slide-in {
    0% { transform: translateY(100vh); }
    100% { transform: translateY(0%); }
    }
</style>

