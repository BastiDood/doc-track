<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Events } from '../../components/types.ts'

    import Button from './Button.svelte';
    import Close from '../icons/Close.svelte';
    
    export let showModal = false;

    let dialog: HTMLDialogElement | null;

    $: if (dialog && showModal) dialog.showModal();

    const dispatch = createEventDispatcher()

    function onClose() {
        showModal = false;
        dispatch(Events.ModalClose)
    }
</script>

<dialog bind:this={dialog} 
    on:close = { () => onClose() }
    on:click|self = {() => dialog?.close()}
    on:keydown|self = { () => dialog?.close()}
    >

    <div class="column"
    on:click|stopPropagation
    on:keydown|stopPropagation
    >
        <div>
            <div id="headerIcon">
                <div>
                    <slot name="header" />
                </div>
                <div>
                    <Close on:click={() => showModal = false} />
                </div>
        </div>
        <hr />
        <div class="column">
            <slot />
            <div id="buttons">
                <slot name="buttons">
                    <Button on:click={() => showModal = false}>Close Modal</Button>
                </slot>
            </div>
        </div>
    </div>
</dialog>

<style>
    /* https://svelte.dev/examples/modal */
    @import url('../../pages/vars.css');

    dialog {
        border-radius: var(--border-radius);
        border: none;
        padding: 0;
    }

    dialog::backdrop {
        background: rgba(0, 0, 0, 0.3);
    }
    
    dialog > div {
        padding: var(--spacing-large);
    }

    dialog[open] {
        animation: zoom var(--animation-length) cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    dialog[open]::backdrop {
		animation: fade var(--animation-length) ease-out;
	}

    .column {
        display: flex;
        flex-direction: column;

    }

    #headerIcon {
        display: flex;
        justify-content: space-between;
    }

    #buttons {
        display: flex;
        justify-content: space-evenly;
    }
</style>