<script>
    import { slide } from 'svelte/transition';
    import { topToastMessage } from '../../stores/ToastStore.ts';
</script>

{#if $topToastMessage !== null}
    {@const { title, body, type } = $topToastMessage}
    <div class={type} transition:slide>
        <h3>{title}</h3>
        <p>{body}</p>
    </div>
{/if}

<style>
    div {
        padding: var(--spacing-large);
        border-radius: var(--spacing-large) var(--spacing-large) 0 0;
        bottom: 0;
        box-sizing: border-box;
        color: white;
        position: fixed;
        width: 100%;
        z-index: 99999;
    }

    h3, p {
        margin: var(--spacing-small);
    }

    .info {
        background-color: var(--primary-color);
    }

    .success {
        background-color: var(--success-bg);
    }

    .error {
        background-color: var(--danger-bg);
    }

    .offline {
        background-color: var(--offline-color);
    }
</style>
