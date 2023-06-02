<script>
    import { slide } from 'svelte/transition';

    import { IconColor, IconSize } from '../types.ts';

    import { topToastMessage } from '../../stores/ToastStore.ts';

    import Close from '../icons/Close.svelte';
</script>

{#if $topToastMessage !== null}
    {@const { title, body, type } = $topToastMessage}
    <main class={type} transition:slide>
        <section>
            <h3>{title}</h3>
            <p>{body}</p>
        </section>
        <div>
            <Close 
                color={IconColor.White}
                size={IconSize.Large}
                on:click={() => topToastMessage.dismiss()} 
                alt="Close Toast" 
            />
        </div>
    </main>
{/if}

<style>
    main {
        align-items: center;
        border-radius: var(--spacing-large) var(--spacing-large) 0 0;
        bottom: 0;
        box-sizing: border-box;
        color: white;
        display: flex;  
        padding: var(--spacing-large);
        position: fixed;
        width: 100%;
        z-index: 99999;
    }

    main > section {
        flex: 1 0 auto;
    }

    main > div {
        cursor: pointer;
        flex: 0 1 auto;
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
