<script lang="ts">
    import type { PaperTrail } from '~model/api.ts';
    import { Document as DocumentModel } from '~model/document.ts';

    import { assert } from '../../assert.ts';
    import { Document } from '../../api/document.ts';
    import { register } from '../register.ts';

    import { allOffices } from '../../stores/OfficeStore.ts';
    import { topToastMessage } from '../../stores/ToastStore.ts';
    import { Vapid } from '../../api/vapid.ts';

    import Button from '../../components/ui/Button.svelte';
    import Notification from '../../components/icons/Notification.svelte';
    import PrintQr from '../../components/ui/qr/PrintQr.svelte';
    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import PageUnavailable from '../../components/ui/PageUnavailable.svelte';
    import Toast from '../../components/ui/Toast.svelte';
    import { ContainerType, IconColor, IconSize, ToastType } from '../../components/types.ts';
    import Container from '../../components/ui/Container.svelte';
    import QrGenerator from '../../components/ui/qr/QrGenerator.svelte';
    import TrackingProgress from '../../components/ui/TrackingProgress.svelte';
    import DocumentDownload from '../../components/icons/DocumentDownload.svelte';

    $: ({ searchParams } = new URL(location.href));
    $: trackingNumber = searchParams.get('id');

    async function getSubscription(manager: PushManager) {
        const maybeSub = await manager.getSubscription();
        if (maybeSub !== null) return maybeSub;
        return manager.subscribe({
            applicationServerKey: await Vapid.getVapidPublicKey(),
            userVisibleOnly: true,
        });
    }

    async function subscribePushNotifications(doc: DocumentModel['id']) {
        if (trackingNumber === null) {
            topToastMessage.enqueue({
                title: 'Subscription Failed',
                body: 'The tracking number is invalid.',
            });
            return;
        }

        // TODO: request for notification permissions first
        const { pushManager } = await register();
        const sub = await getSubscription(pushManager);
        await Vapid.sendSubscription(sub.toJSON());
        await Vapid.hookSubscription({ sub: sub.endpoint, doc });
        topToastMessage.enqueue({
            title: 'Subscribed to Document',
            body: 'You will recieve updates for this document.',
            type: ToastType.Success,
        });
    }

    function renderOverview(trail: PaperTrail[], allOffices: Record<string, string>) {
        const [first, ...rest] = trail;
        const last = rest.at(-1);

        if (typeof first === 'undefined' && typeof last === 'undefined')
            return null;

        if (typeof first !== 'undefined' && typeof last !== 'undefined')
            return {
                documentFor: first.remark,
                documentRemark: last.remark,
                status: last.status,
                origin: first.target === null ? null : allOffices[first.target] ?? null,
                current: last.target === null ? null : allOffices[last.target] ?? null,
            };

        assert(typeof first !== 'undefined' && typeof last === 'undefined');
        const origin = first.target === null ? null : allOffices[first.target] ?? null;
        return {
            documentFor: first.remark,
            documentRemark: first.remark,
            status: first.status,
            origin,
            current: origin,
        };
    }

    let prev: Date | null = null;
    function computeTimeDiff(date: Date) {
        if (prev === null) {
            prev = date;
            return 'Start';
        }

        let diff = date.getTime() - prev.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * (1000 * 60 * 60 * 24);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);
        const mins = Math.floor(diff / (1000 * 60));
        diff -= mins * (1000 * 60);
        const seconds = Math.floor(diff / 1000);
        diff -= seconds * 1000;
        prev = date;
        return `${days}d ${hours}h ${mins}m ${seconds}s`;
    }

    const allOfficeReady = allOffices.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });
</script>

<TopBar open />
<main class="column">
    {#if trackingNumber === null}
        No tracking number provided.
    {:else}
        {#await Promise.all([Document.getPaperTrail(trackingNumber), allOfficeReady])}
            Loading paper trail...
        {:then [meta, _]}
            {#if meta === null}
                <h1>Uh oh!</h1>
                <p>Document does not exist.</p>
            {:else}
                <header>
                    <h1>Tracking Page</h1>
                    <div>
                        <Button on:click={subscribePushNotifications.bind(null, trackingNumber)}>
                            <Notification color={IconColor.White} alt="Bell icon for subscribing to push notifications" /> Subscribe to Push Notifications
                        </Button>
                        <PrintQr trackingNumber={trackingNumber} showText allowRedirect />
                    </div>
                </header>
                {@const { title, category, mime, trail } = meta}
                {@const overview = renderOverview(trail, $allOffices)}
                <section>
                    <QrGenerator url={title} />
                    <div class="column">
                        <p>Tracking No: {trackingNumber}</p>
                        <h1 class="removemargin">{title}</h1>
                        <h3 class="removemargin">{category}</h3>
                    </div>
                </section>
                <TrackingProgress {trail} />
                <Container ty={ContainerType.Divider}>
                    <table>
                        <thead>
                            <th>Property</th>
                            <th>Details</th>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>Document Tracking Number</b></td>
                                <td>{trackingNumber}</td>
                            </tr>
                            <tr>
                                <td><b>Document Title</b></td>
                                <td>{title}</td>
                            </tr>
                            <tr>
                                <td><b>Document Category</b></td>
                                <td>{category}</td>
                            </tr>
                            {#if overview !== null}
                                <tr>
                                    <td><b>Document For</b></td>
                                    <td>{overview.documentFor}</td>
                                </tr>
                                <tr>
                                    <td><b>Document Remarks</b></td>
                                    <td>{overview.documentRemark}</td>
                                </tr>
                                <tr>
                                    <td><b>Originating Office</b></td>
                                    <td>{overview.origin}</td>
                                </tr>
                                <tr>
                                    <td><b>Current Office</b></td>
                                    <td>{overview.current}</td>
                                </tr>
                                <tr>
                                    <td><b>Document Status</b></td>
                                    <td>{overview.status}</td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </Container>
                <Container ty={ContainerType.Divider}>
                    <h3>File Attachment</h3>
                    <a download type={mime} href="/api/document/download?doc={trackingNumber}">
                        <div class="column download">
                                <DocumentDownload size={IconSize.Large} alt="Download the attached document."/>
                                Download File Attachment 
                        </div>
                    </a>
                </Container>
                <Container ty={ContainerType.Divider}>
                    <h3>Paper Trail</h3>
                    <table>
                        <thead>
                            <tr>
                                <td>Office</td>
                                <td>Creation</td>
                                <td>Time Elapsed</td>
                                <td>Action</td>
                                <td>Remarks</td>
                                <td>Evaluator</td>
                            </tr>
                        </thead>
                        <tbody>
                            {#each trail as { target, creation, status, remark, name, picture, email }}
                                <tr>
                                    <td>
                                        {#if target === null}
                                            End
                                        {:else}
                                            {$allOffices[target]}
                                        {/if}
                                    </td>
                                    <td>{creation.toLocaleString()}</td>
                                    <td>{computeTimeDiff(creation)}</td>
                                    <td>{status}</td>
                                    <td>{remark}</td>
                                    <td class="evaluator">
                                        <img src={picture} alt={name} />
                                        <a href="mailto:{email}">{name}</a>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </Container>
            {/if}
        {:catch err}
            <PageUnavailable {err} />
        {/await}
    {/if}
    <Toast />
</main>

<style>
    main {
        margin: var(--spacing-large);
        gap: var(--spacing-large);
    }

    .column {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .download {
        display: flex;
        align-items: center;
        border: var(--spacing-tiny) black dotted;
        border-radius: var(--border-radius);
    }

    .download:hover {
        background-color: var(--hover-color);
    }

    .removemargin {
        margin: 0;
    }
    
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
    }

    section {
        display: flex;
        justify-content: flex-start;
        align-items: center;

    }

    .evaluator {
        align-items: center;
        display: flex;
        gap: var(--spacing-normal);
    }

    .evaluator > img {
        border-radius: 50%;
        height: 2rem;
    }
</style>
