<script lang="ts">
    import Close from '../icons/Close.svelte';

    export let showModal = false;
    export let title: string;

    let dialog: HTMLDialogElement | null = null;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    $: if (showModal) dialog?.showModal(); else dialog?.close();

    function offModal() {
        showModal = false;
    }
</script>

<dialog on:close bind:this={dialog}>
    <header>
        <h1>{title}</h1>
        <div><Close on:click={offModal} alt="Close Modal"/></div>
    </header>
    <hr />
    <slot />
</dialog>

<style>
    /* https://svelte.dev/examples/modal */
    @import url('../../pages/vars.css');

    dialog {
        border-radius: var(--border-radius);
        border: none;
        padding: var(--spacing-large);
    }

    header {
        display: flex;
    }

    header > h1 {
        flex-grow: 1;
        margin: 0;
    }

    header > div {
        flex-grow: 0;
        cursor: pointer;
    }
</style>
