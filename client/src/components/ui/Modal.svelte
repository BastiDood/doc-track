<script lang="ts">

    import Button from './Button.svelte';
    import Close from '../icons/Close.svelte';

    export let showModal = false;
    export let title: string;

    let dialog: HTMLDialogElement | null = null;
    $: if (showModal) dialog?.showModal(); else dialog?.close();

    function offModal() {
        showModal = false;
    }
</script>

<dialog on:close bind:this={dialog}>
    <header>
        <h1>{title}</h1>
        <div><Close on:click={offModal} alt="Close modal"/></div>
    </header>
    <hr />
    <slot />
    <hr />
    <slot name="buttons">
        <Button on:click={offModal}>Close Modal</Button>
    </slot>
</dialog>

<style>
    /* https://svelte.dev/examples/modal */
    @import url('../../pages/vars.css');

    dialog {
        border-radius: var(--border-radius);
        border: none;
        display: flex;
        flex-direction: column;
        padding: var(--spacing-large);
    }

    header {
        display: flex;
    }

    header > h1 {
        flex-grow: 1;
    }

    header > div {
        flex-grow: 0;
    }
</style>
