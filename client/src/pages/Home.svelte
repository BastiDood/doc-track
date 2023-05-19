<script lang="ts">
    import Button from '../components/ui/Button.svelte';
    import { goToTrackingPage } from '../components/ui/itemrow/util.ts';
    import { register } from './register.ts';
    import { ButtonType, IconColor } from '../components/types.ts';

    import Google from '../components/icons/Google.svelte';
    import Camera from '../components/icons/Camera.svelte';
    import Search from '../components/icons/Search.svelte';
    import TextInput from '../components/ui/TextInput.svelte';
    import Modal from '../components/ui/Modal.svelte';
    import QrScanner from '../components/ui/QRScanner.svelte';

    const placeholderSrc = new URL('../assets/images/logo-background.png', import.meta.url);
    let showScan = false as boolean;

    let trackingNumber = '';
</script>

<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        <div class="middle-container">
            <img src={placeholderSrc} alt="DocTrack Logo" />
            <h3>DocTrack: Document Tracking System</h3>
            <a href="/auth/login">
                <Button type={ButtonType.Primary}><Google color={IconColor.White} alt="Log in with UP Mail" />Log in with University of the Philippines Mail</Button>
            </a>
            <div class="search-container">
                <TextInput placeholder="Enter tracking number here..." label="Tracking Number:" name="track-number" bind:value={trackingNumber} />
                <Button type={ButtonType.Primary} on:click={() => (showScan = true)}><Camera color={IconColor.White} alt="Take/select an image." /></Button>
                <a href={`/track?id=${trackingNumber}`}>
                    <Button type={ButtonType.Primary}><Search color={IconColor.White} alt="Search specified tracking number." /></Button>
                </a>
            </div>
        </div>
    {/await}
    {#if showScan}
        <Modal showModal on:close={() => (showScan = false)} title="Scan/Select a File">
            <QrScanner on:onDocumentScan={goToTrackingPage.bind(null, trackingNumber)} bind:maybeId={trackingNumber} />
        </Modal>
    {/if}
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
