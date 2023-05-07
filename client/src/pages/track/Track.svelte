<script lang="ts">
    import { ButtonType, InputType } from '../../components/types.ts';

    import Notification from '../../components/icons/Notification.svelte';
    import Button from '../../components/ui/Button.svelte';
    import TextInput from '../../components/ui/TextInput.svelte';
    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import Camera from '../../components/icons/Camera.svelte';
    import Search from '../../components/icons/Search.svelte';

    import { allOffices } from './../dashboard/stores/OfficeStore.ts';

    import { Document } from '../../api/document.ts';


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
        <h2>Document </h2>

        <Button>
            <Notification /> Subscribe to Push Notifications
        </Button>
        {console.log(trail)}
        {#if trail.length == 0}
            <h1>Uh oh!</h1>
            <p>Something went wrong. Kindly re-check your tracking id above.</p>
        {/if}
        <section>
            <table>
                <tr>
                    <td><p class="header-color"><b>Overview</b></p></td>
                    <td></td>
                </tr>
                <tr>
                    <td><b>Document Title</b></td>
                    <td>{trail[0]?.title}</td>
                </tr>
                <tr>
                    <td><b>Document Tracking Number</b></td>
                    <td>{trackingNumber}</td>
                </tr>
                <tr>
                    <td><b>Document Category</b></td>
                    <td>{trail[0]?.category}</td>
                </tr>
                <tr>
                    <td><b>Document For</b></td>
                    <td>{trail[0]?.remark}</td>
                </tr>
                <tr>
                    <td><b>Document Remarks</b></td>
                    <td>{trail[trail.length - 1]?.remark}</td>
                </tr>
                <tr>
                    <td><b>Originating Office</b></td>
                    <td>{trail[0]?.target}</td>
                </tr>
                <tr>
                    <td><b>Current Office</b></td>
                    <td>{trail[trail.length - 1]?.target}</td>
                </tr>
                <tr>
                    <td><b>Document Status</b></td>
                    <td>{trail[trail.length - 1]?.status.toLocaleUpperCase()}</td>
            </table>
            <br>
            <table>
                <th class="table-title">Files</th>
                <!-- <tr><a href={fileUrl}>{trail[0]?.title}</a></tr> -->
                <tr>No file attachment.</tr>
            </table>
            <br>
            <table>
                <th class="table-title">Paper Trail</th>
                <tr><b>Office</b></tr>
                <tr><b>Remarks</b></tr>
                <tr><b>Date</b></tr>
                {#each {length: trail.length} as _, i}
                    <tr>
                        <td>{trail[i]?.target}</td>
                        <td>{trail[i]?.remark}</td>
                        <td>{trail[i]?.creation}</td>
                    </tr>
                {/each}
            <!-- 
            <table>
                <th class="table-title">History</th>
                <tr><b>Office</b></tr>
                <tr><b>Remarks</b></tr>
                <tr><b>Date</b></tr>
            </table>
            <br>
            <table>
                <th class="table-title">Paper Trail</th>
                <tr>
                    {#each Object.keys(trail[0]) as key}
                        <td><b>{key}</b></td>
                    {/each}
                </tr>
                {#each trail as item}
                    <tr>
                        {#each Object.keys(item) as key}
                            <td>{item[key]}</td>
                        {/each}
                    </tr>
                {/each}
            </table> -->
        </section>
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

    .table-title {
        color: var(--color-primary);
        font-size: var(--font-size-large);
        text-align: center;
    }

    tr {
        border: 1px solid;
        border-radius: var(--border-radius);
        border-color : var(--color-primary);
    }
</style>
