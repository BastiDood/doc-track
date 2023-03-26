<script lang="ts">
    export let show = false;
    
    let context: HTMLDialogElement | null = null;
    $: if (show) context?.showModal();

    function offShow() {
        show = false;
    }

    function closeDialog(this: HTMLDialogElement) {
        this.close();
    }
</script>

<dialog bind:this={context} on:close={offShow} on:click|self={closeDialog} on:keydown>
    <div on:click|stopPropagation on:keydown|stopPropagation>
        <slot />
    </div>
</dialog>

<style>
    @import url('../../../pages/vars.css');

    dialog {
        background-color: var(--dashboard-bg);
        border: var(--spacing-tiny) solid black;
        bottom: -95%;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        display: block;
        position: relative;
        width: 100%;
    }

    dialog[open] {
        animation: slide-in var(--animation-length) forwards;
    }

    @keyframes slide-in {
        0% { transform: translateY(100vh); }
        100% { transform: translateY(0%); }
    }
</style>

