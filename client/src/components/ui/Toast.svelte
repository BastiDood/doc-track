<script>
    import { slide } from 'svelte/transition';
    import { topToastMessage } from '../../stores/ToastStore.ts';
    import Close from '../icons/Close.svelte';
    import { IconColor, IconSize } from '../types.ts';
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
        padding: var(--spacing-large);
        border-radius: var(--spacing-large) var(--spacing-large) 0 0;
        bottom: 0;
        box-sizing: border-box;
        color: white;
        position: fixed;
        width: 100%;
        z-index: 99999;
        display: flex;  
    }

    main > section {
        flex-grow: 1;
    }

    main > div {
        flex-grow: 0;
        cursor: pointer;
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
