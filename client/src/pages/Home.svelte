<script lang="ts">
    import { topToastMessage } from '../stores/ToastStore.ts';
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
    import { assert } from '../assert.ts';
    import PageUnavailable from '../components/ui/PageUnavailable.svelte';

    import MainLogo from '../components/logo/MainLogo.svelte';

    const placeholderSrc = new URL('../assets/images/logo-background.png', import.meta.url);
    let showScan = false as boolean;

    let trackingNumber = '';

    function scanHandler({ detail }: CustomEvent<string>) {
        goToTrackingPage(detail);
    }

    const reg = register().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });
</script>

<main>
    {#await reg}
        Waiting for service worker...
    {:then}
        <div class="middle-container">
            <MainLogo alt='Logo' />
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
    {:catch err}
        <PageUnavailable {err} />
    {/await}
    {#if showScan}
        <Modal showModal on:close={() => (showScan = false)} title="Scan/Select a File">
            <QrScanner on:onDocumentScan={scanHandler} />
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

    .middle-container {
        text-align: center;
        padding: var(--spacing-large);
        border: var(--spacing-tiny) solid var(--primary-color);
        background-color: var(--login-bg);
        border-radius: var(--border-radius);
    }

    .search-container {
        padding: var(--spacing-small);
        margin: 0 auto;
    }
</style>
