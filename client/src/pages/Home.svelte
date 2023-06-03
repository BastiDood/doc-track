<script lang="ts">
    import { fade } from 'svelte/transition';

    import { assert } from '../assert.ts';
    import { register } from './register.ts';

    import Button from '../components/ui/Button.svelte';
    import Google from '../components/icons/Google.svelte';
    import Camera from '../components/icons/Camera.svelte';
    import Search from '../components/icons/Search.svelte';
    import TextInput from '../components/ui/TextInput.svelte';
    import HomeLogo from '../components/icons/HomeLogo.svelte';
    import Modal from '../components/ui/Modal.svelte';
    import QrScanner from '../components/ui/QRScanner.svelte';
    import PageUnavailable from '../components/ui/PageUnavailable.svelte';
    import Toast from '../components/ui/Toast.svelte';

    import { topToastMessage } from '../stores/ToastStore.ts';
    import { goToTrackingPage } from '../components/ui/itemrow/util.ts';
    import { ButtonType, IconColor } from '../components/types.ts';

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

    const logoAngry = new URL('../assets/icons/bootstrap/techstack.svg', import.meta.url);
</script>

<main>
    {#await reg}
        Waiting for service worker...
    {:then}
        <article in:fade={{ duration: 1000 }}>
            <HomeLogo alt='Logo' />
            <div id="doctrack">
                {#each 'DOCTRACK' as char, i}
                    {@const delay = 500 + i * 150}
                    <div in:fade={{ delay, duration: 150 }}>{char}</div>
                {/each}
            </div>
            <b in:fade={{ delay: 2000, duration: 200 }}>Document Tracking System</b>
            <a href="/auth/login">
                <Button type={ButtonType.Primary}><Google color={IconColor.White} alt="Log in with UP Mail" />Log in with University of the Philippines Mail</Button>
            </a>
            <section>
                <TextInput placeholder="Enter tracking number here..." label="Tracking Number:" name="track-number" bind:value={trackingNumber} />
                <Button type={ButtonType.Primary} on:click={() => (showScan = true)}><Camera color={IconColor.White} alt="Take/select an image." /></Button>
                <a href="/track?id={trackingNumber}">
                    <Button type={ButtonType.Primary}><Search color={IconColor.White} alt="Search specified tracking number." /></Button>
                </a>
            </section>
        </article>
    {:catch err}
        <PageUnavailable {err} />
    {/await}
    {#if showScan}
        <Modal showModal on:close={() => (showScan = false)} title="Scan/Select a File">
            <QrScanner on:onDocumentScan={scanHandler} />
        </Modal>
    {/if}
    <Toast />
</main>

<footer>
    <p>© <a href="https://github.com/BastiDood/doc-track">2023 Doctrack</a>. All rights reserved.</p>
    <img type="image/svg" alt="Tech stack" src="https://skillicons.dev/icons?i=svelte,ts,deno,postgres,html,css,&theme=light" />
</footer>

<style>
    main {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
    }

    article {
        padding: var(--spacing-large);
        border: var(--spacing-tiny) solid var(--primary-color);
        background-color: var(--login-bg);
        border-radius: var(--border-radius);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    a {
        text-decoration: none;
    }

    b {
        display: block;
        color: var(--text-color);
        font-size: 1.5rem;
        font-weight: 400;
    }

    #doctrack {
        color: var(--primary-color);
        display: flex;
        font-size: 2rem;
        font-weight: 700;
        justify-content: center;
        column-gap: 0.75rem;
    }

    footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
        padding: var(--spacing-small);
        color: var(--text-color);
    }

    section {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }
</style>
