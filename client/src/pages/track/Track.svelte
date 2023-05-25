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
        });
    }

    function renderOverview(trail: PaperTrail[], allOffices: Record<string, string>) {
        const [first, ...rest] = trail;
        const last = rest.at(-1);

        if (typeof first === 'undefined' && typeof last === 'undefined')
            return null;

        if (typeof first !== 'undefined' && typeof last !== 'undefined')
            return {
                title: first.title,
                category: first.category,
                documentFor: first.remark,
                documentRemark: last.remark,
                status: first.status,
                origin: first.target === null ? null : allOffices[first.target] ?? null,
                current: last.status,
            };

        assert(typeof first !== 'undefined' && typeof last === 'undefined');
        const origin = first.target === null ? null : allOffices[first.target] ?? null;
        return {
            title: first.title,
            category: first.category,
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

    const allOffice = allOffices.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });
</script>

<TopBar open />
<main>
    {#if trackingNumber === null}
        <p>No tracking number provided.</p>
    {:else}
        {#await Promise.all([Document.getPaperTrail(trackingNumber), allOffice])}
            Loading paper trail...
        {:then [trail, _]}
            {@const overview = renderOverview(trail, $allOffices)}
            {#if overview === null}
                <h1>Uh oh!</h1>
                <p>Something went wrong. Kindly re-check your tracking id above.</p>
            {:else}
                <h2>Document {overview.title}</h2>
                <Button on:click={subscribePushNotifications.bind(null, trackingNumber)}>
                    <Notification alt="Bell icon for subscribing to push notifications" /> Subscribe to Push Notifications
                </Button>
                <br />
                <PrintQr trackingNumber={trackingNumber} showText allowRedirect />
                <section>
                    <table>
                        <tr>
                            <td><p class="header-color"><b>Overview</b></p></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td><b>Document Title</b></td>
                            <td>{overview.title}</td>
                        </tr>
                        <tr>
                            <td><b>Document Tracking Number</b></td>
                            <td>{trackingNumber}</td>
                        </tr>
                        <tr>
                            <td><b>Document Category</b></td>
                            <td>{overview.category}</td>
                        </tr>
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
                    </table>
                    <br />
                    <table>
                        <td><p class="header-color"><b>File Attachment</b></p></td>
                        <tr>No file attachment.</tr>
                    </table>
                    <br />
                    <table>
                        <td><p class="header-color"><b>Paper Trail</b></p></td>
                        <tr>
                            <td><b>Office</b></td>
                            <td><b>Creation</b></td>
                            <td><b>Time Elapsed</b></td>
                            <td><b>Action</b></td>
                            <td><b>Remarks</b></td>
                            <td><b>Evaluator</b></td>
                        </tr>
                        {#each trail as { target, creation, status, remark, email }}
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
                                <td>{email}</td>
                            </tr>
                        {/each}
                    </table>
                </section>
            {/if}
        {/await}
    {/if}
</main>

<style>
    @import url('../../pages/vars.css');

    .header-color {
        color: blue;
        font-size: var(--font-size-large);
    }

    table {
        border: 3px solid;
        padding: var(--spacing-large);
        left: 1em;
        border-spacing: var(--spacing-small);
        border-radius: var(--border-radius);
        color: var(--color-primary);
        width: 100%;
    }

    tr {
        border: 1px solid;
        border-radius: var(--border-radius);
        border-color : var(--color-primary);
    }
</style>
