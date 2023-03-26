<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events } from '../../components/types.ts';

    import Button from './Button.svelte';
    import Close from '../icons/Close.svelte';

    export let showModal = false;
    export let title: string;

    let dialog: HTMLDialogElement | null;

    $: if (showModal) dialog?.showModal();

    const dispatch = createEventDispatcher();

    function closeDialog(this: HTMLDialogElement) {
        this.close();
    }

    function onClose() {
        showModal = false;
        dispatch(Events.ModalClose);
    }
</script>

<dialog on:close={onClose} on:click|self={closeDialog} on:keydown|self={closeDialog}>
    <header>
        <h1>{title}</h1>
        <div><Close on:click={() => showModal = false} /></div>
    </header>
    <hr />
    <slot />
    <hr />
    <slot name="buttons">
        <Button on:click={() => showModal = false}>Close Modal</Button>
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
