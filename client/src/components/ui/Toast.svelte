<script>
    import { topToastMessage } from '../../pages/dashboard/stores/ToastStore.ts';
</script>

<!-- TODO: For now, all toast messages are treated as errors. We should add a configuration for using different colors. -->
{#if $topToastMessage !== null}
    {@const { title, body, type } = $topToastMessage}
    <div class={type}>
        <h3>{title}</h3>
        <p>{body}</p>
    </div>
{/if}

<style>
    div {
        padding: var(--spacing-small);
        border-radius: var(--spacing-normal);
        bottom: 0;
        box-sizing: border-box;
        color: white;
        position: fixed;
        width: 100%;
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
