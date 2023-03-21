<script lang="ts">
    import Button from "./Button.svelte";

    export let showModal = false;
    export let isForm = false;

    let dialog: HTMLDialogElement;

    $: if (dialog && showModal) dialog.showModal();
</script>

<dialog
    bind:this={dialog}
    class:form={isForm}
    on:close = { () => showModal = false }
    on:click|self = { () => dialog.close() }
    on:keypress|stopPropagation
>
    <div 
        on:click|stopPropagation
        on:keypress|stopPropagation
    >
        <slot name="header" />
        <hr />
        <slot/>
        <hr />
        <slot name="buttons" >
            <Button> Sample Text </Button>
        </slot>

    </div>
</dialog>

<style>
    @import url('../../pages/global.css');

    dialog {
        max-width: 32em;
        width: 80vh;
        border-radius: var(--border-radius);
        border: none;
        padding: 0;
    }

    .form {
        max-width: 80%;
        max-height: 80%;
    }

    dialog::backdrop {
        background: rgba(0, 0, 0, 0.3);
    }
    
    dialog > div {
        padding: var(--spacing-large);
    }

    dialog[open] {
        animation: zoom var()
    }
</style>