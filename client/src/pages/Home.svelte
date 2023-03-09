<script>
    import Button from '../components/ui/Button.svelte';

    import { register } from './register.ts';
    import { ButtonType } from '../components/types.ts';

    import Google from '../components/icons/Google.svelte';
    import Camera from '../components/icons/Camera.svelte';
    import Search from '../components/icons/Search.svelte';

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
                <Button type={ButtonType.Primary}><Google />Log in with University of the Philippines Mail</Button>
            </a>
            <div class="search-container">
                <input type="text" placeholder="Enter tracking number here" class="tracking-field" />
                <Button type={ButtonType.Primary}><Camera /></Button>
                <Button type={ButtonType.Primary}><Search /></Button>
            </div>
        </div>
    {/await}
</main>

<style>
    main {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
    }

    img {
        border-radius: 10pt;
        max-width: 512px;
    }

    .middle-container {
        text-align: center;
        padding: 5pt;
        border: 1pt;
        background-color: #ffb334;
    }

    .search-container {
        padding: 5pt;
        margin: 0 auto;
    }

    .tracking-field {
        padding: 5pt;
        border: 1pt;
        border-radius: 5pt;
        margin-right: 5pt;
    }
</style>
