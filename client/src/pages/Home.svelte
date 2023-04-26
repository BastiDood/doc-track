<script>
    import Button from '../components/ui/Button.svelte';

    import { register } from './register.ts';
    import { ButtonType, InputType, IconColor } from '../components/types.ts';

    import Google from '../components/icons/Google.svelte';
    import Camera from '../components/icons/Camera.svelte';
    import Search from '../components/icons/Search.svelte';
    import TextInput from '../components/ui/TextInput.svelte';

    const placeholderSrc = new URL('../assets/images/logo-background.png', import.meta.url);
</script>

<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        <div class="middle-container">
            <img src={placeholderSrc} alt="DocTrack Logo" />
            <h3>DocTrack: Document Tracking System</h3>
            <a href="/auth/login">
                <Button type={ButtonType.Primary}><Google color={IconColor.White} alt="Log in with UP Mail"/>Log in with University of the Philippines Mail</Button>
            </a>
            <div class="search-container">
                <TextInput type={InputType.Primary} placeholder="Enter tracking number here..." label="Tracking Number:"/>
                <Button type={ButtonType.Primary}><Camera alt="Take/select an image." /></Button>
                <a href="/track">
                    <Button type={ButtonType.Primary}><Search alt="Search specified tracking number. "/></Button>
                </a>
                
            </div>
        </div>
    {/await}
</main>

<style>
    @import url('global.css');

    main {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
    }

    a {
        text-decoration: none;
    }

    img {
        border-radius: var(--border-radius);
        max-width: 512px;
    }

    .middle-container {
        text-align: center;
        padding: var(--spacing-small);
        border: var(--spacing-tiny) solid var(--primary-color);
        background-color: var(--login-bg);
        border-radius: var(--border-radius);
    }

    .search-container {
        padding: var(--spacing-small);
        margin: 0 auto;
    }
</style>
