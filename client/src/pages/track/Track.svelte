<script lang="ts">
    import Button from '../../components/ui/Button.svelte';
    import Camera from '../../components/icons/Camera.svelte';
    import Notification from '../../components/icons/Notification.svelte';
    import Search from '../../components/icons/Search.svelte';
    import TextInput from '../../components/ui/TextInput.svelte';
    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import type { PaperTrail } from '../../../../model/src/api.ts';
    import { ButtonType } from '../../components/types.ts';
    import { Document } from '../../api/document.ts';
    import { allOffices } from './../dashboard/stores/OfficeStore.ts';
    import { assert } from '../../assert.ts';

    const { searchParams } = new URL(location.href);
    let trackingNumber = searchParams.get('id') ?? '';

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
                current: last.target === null ? null : allOffices[last.target] ?? null,
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
</script>

<main>
    <TopBar open>
        <nav>
            <TextInput name="tracking-number" placeholder="Enter tracking number here..." label="" bind:value={trackingNumber} />
            <Button type={ButtonType.Primary}><Camera alt="Take/select an image." /></Button>
            <a href={`/track?id=${trackingNumber}`}>
                <Button type={ButtonType.Primary}><Search alt="Search specified tracking number." /></Button>
            </a>
        </nav>
    </TopBar>

    {#await Promise.all([Document.getPaperTrail(trackingNumber), allOffices.load()])}
        <p>Loading Paper Trail...</p>
    {:then [trail, _allOffices]}
        {@const overview = renderOverview(trail, $allOffices)}
        {#if overview === null}
            <h1>Uh oh!</h1>
            <p>Something went wrong. Kindly re-check your tracking id above.</p>
        {:else}
            <h2>Document {overview.title}</h2>
            <Button>
                <Notification alt="Bell icon for subscribing to push notifications" /> Subscribe to Push Notifications
            </Button>
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
                <br>
                <table>
                    <td><p class="header-color"><b>File Attachment</b></p></td>
                    <tr>No file attachment.</tr>
                </table>
                <br>
                <table>
                    <td><p class="header-color"><b>Paper Trail</b></p></td>
                    <tr>
                        <td><b>Office</b></td>
                        <td><b>Creation</b></td>
                        <td><b>Action</b></td>
                        <td><b>Remarks</b></td>
                        <td><b>Evaluator</b></td>
                    </tr>
                    {#each trail as { target, creation, status, remark, email }}
                        <tr>
                            <td>{target}</td>
                            <td>{creation}</td>
                            <td>{status}</td>
                            <td>{remark}</td>
                            <td>{email}</td>
                        </tr>
                    {/each}
            </section>
        {/if}
    {:catch error}
        <h1>Uh oh!</h1>
        <p>Something went wrong. Kindly re-check your tracking id above.</p>
        <p style:color="red">Error: {error}</p>
    {/await}
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
