<script lang="ts">
    import Button from "./Button.svelte";

    export let showModal = false;

    let dialog: HTMLDialogElement | null;

    $: if (showModal) dialog?.showModal();
</script>

<dialog
    bind:this={dialog}
    on:close = {() => showModal = false}
    on:click|self = {() => dialog?.close()}
    on:keydown = {() => showModal = false}
>
    <div>
        <slot name="header" />
        <hr />
        <slot/>
        <hr />
        <slot name="buttons" >
            <Button on:click={() => dialog?.close()}>Close Modal</Button>
        </slot>
    </div>
</dialog>

<style>
    /* https://svelte.dev/examples/modal */
    @import url('../../pages/global.css');

    dialog {
        max-width: 32em;
        width: 80vh;
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

    @keyframes zoom {
        from {
            transform: scale(0.95)
        }
        to {
            transform: scale(1);
        }
    }

    dialog[open]::backdrop {
		animation: fade var(--animation-length) ease-out;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>