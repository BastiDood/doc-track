<script lang="ts">
    export let show = false as boolean;

    let context: HTMLDialogElement | null = null;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    $: if (show) context?.showModal();

    function offShow() {
        show = false;
    }

    function closeDialog(this: HTMLDialogElement) {
        this.close();
    }
</script>

<!-- FIXME: we may want to reconsider the buggy behavior of closing the dialog for each click -->
<dialog bind:this={context} on:close={offShow} on:close on:click|self={closeDialog} on:keydown>
    <div on:click|stopPropagation on:keydown|stopPropagation>
        <slot />
    </div>
</dialog>

<style>
    @import url('../../../pages/vars.css');

    dialog {
        background-color: var(--dashboard-bg);
        border: var(--spacing-tiny) solid black;
        bottom: -80vh;
        border-radius: var(--border-radius);
        position: relative;
        width: 100%;
    }

    dialog[open] {
        animation: slide-in var(--animation-length) forwards;
    }

    @keyframes slide-in {
        0% { transform: translateY(5vh); }
        100% { transform: translateY(0); }
    }
</style>

