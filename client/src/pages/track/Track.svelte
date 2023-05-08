<script lang="ts">
    import { ButtonType, InputType } from '../../components/types.ts';

    import Notification from '../../components/icons/Notification.svelte';
    import Button from '../../components/ui/Button.svelte';
    import TextInput from '../../components/ui/TextInput.svelte';
    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import Camera from '../../components/icons/Camera.svelte';
    import Search from '../../components/icons/Search.svelte';

    //  TODO: Cleanup
    import { allOffices } from './../dashboard/stores/OfficeStore.ts';
    import type { PaperTrail } from '../../../../model/src/api.ts';
    //

    import { Document } from '../../api/document.ts';
    import { assert } from '../../assert.ts';


    // // TODO: Add API calls to get document details using the Tracking Number (SPRINT 4)
    // const docTrackingNumber = '1234567890';
    
    // // TODO: Populate based on API calls (SPRINT 4)
    // const docTitle = 'Document';

    // const fileUrl = 'https://ocs.ceat.uplb.edu.ph/wp-content/uploads/2020/10/Dropping-Form.pdf';
    // const fileName = 'Drop Form.pdf';

    // const trail = [ // Contains dictionary with keys Office, In, Out, Elapsed Time, Action, Remarks
    //     {
    //         'Office': 'Department of Computer Science',
    //         'In': '2021-04-20 12:00:00', // Should be a DateTime object (SPRINT 4)
    //         'Out': '2021-04-20 12:00:00',
    //         'Elapsed Time': '30s',
    //         'Action': 'SENT',
    //         'Remarks': 'Done',
    //     },
    //     { // College of Engineering
    //         'Office': 'College of Engineering',
    //         'In': '2021-04-20 12:00:00',
    //         'Out': '',
    //         'Elapsed Time': '',
    //         'Action': 'RECEIVED',
    //         'Remarks': 'Processing',
    //     },
    // ];

    // const overview = {
    //     'Document Title': 'Document',
    //     'Document Tracking Number': docTrackingNumber,
    //     'Document Type': 'Letter',
    //     'Document For': 'Distribution/disubursement',
    //     'Document Remarks': 'LGTM!',
    //     'Originating Office': 'Department of Computer Science', // TODO: Given ID, get office name
    //     'Current Office': 'College of Engineering',
    //     'Document Status': 'SENT',
    // };

    const { searchParams } = new URL(location.href);
    let trackingNumber = searchParams.get('id') ?? '';

    function formatElapsedTime(date2: Date, date1: Date): string {
        const elapsed = Math.abs(date2.getTime() - date1.getTime());
        const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        const hours = Math.floor(elapsed / (1000 * 60 * 60) % 24);
        const minutes = Math.floor(elapsed / (1000 * 60) % 60);
        const seconds = Math.floor(elapsed / 1000 % 60);

        if (days > 0)
            return `${days}d ${hours}h ${minutes}m`;
        else if (hours > 0)
            return `${hours}h ${minutes}m`;
        else if (minutes > 0)
            return `${minutes}m ${seconds}s`;
    
        return `${seconds}s`;
    }

    function formatPrint(date: Date): string {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    function renderOverview(trail: PaperTrail[]) {
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
                origin: first.target,
                current: last.target,
            };
        assert(typeof first !== 'undefined' && typeof last === 'undefined');
        return {
            title: first.title,
            category: first.category,
            documentFor: first.remark,
            documentRemark: first.remark,
            status: first.status,
            origin: first.target,
            current: first.target,
        };
    }
</script>

<svelte:head>
    <title>DocTrack</title>
</svelte:head>

<main>
    <TopBar open nodrawer>
        <nav>
            <TextInput type={InputType.Primary} placeholder="Enter tracking number here..." label="" bind:value={trackingNumber} />
            <Button type={ButtonType.Primary}><Camera alt="Take/select an image." /></Button>
            <a href={`/track?id=${trackingNumber}`}>
                <Button type={ButtonType.Primary}><Search alt="Search specified tracking number." /></Button>
            </a>
        </nav>
    </TopBar>

    {#await Document.getPaperTrail(trackingNumber)}
        <p>Loading Paper Trail...</p>
    {:then trail}
        {@const overview = renderOverview(trail)}
        {#if overview === null}
            <h1>Uh oh!</h1>
            <p>Something went wrong. Kindly re-check your tracking id above.</p>
        {:else}
            <h2>Document {overview.title}</h2>
            <Button>
                <Notification /> Subscribe to Push Notifications
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
                    <!-- <tr><a href={fileUrl}>{trail[0]?.title}</a></tr> -->
                    <tr>No file attachment.</tr>
                </table>
                <br>
                <table>
                    <td><p class="header-color"><b>Paper Trail</b></p></td>
                    <tr>
                        <td><b>Office</b></td>
                        <td><b>In</b></td>
                        <td><b>Out</b></td>
                        <td><b>Elapsed Time</b></td>
                        <td><b>Action</b></td>
                        <td><b>Remarks</b></td>
                        <td><b>Evaluator</b></td>
                    </tr>
                    {#each trail as { target, creation, status, remark, email }}
                        <tr>
                            <td>{target}</td>
                            <td>{formatPrint(creation)}</td>
                            <td>{formatPrint(creation)}</td>
                            <td>WIP</td>
                            <td>{formatElapsedTime(new Date, creation)}</td>
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
        <p style="color: red;">Error: {error}</p>
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
