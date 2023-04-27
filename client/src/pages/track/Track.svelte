<script>
    import Notification from '../../components/icons/Notification.svelte';
    import Button from '../../components/ui/Button.svelte';
    import TextInput from '../../components/ui/TextInput.svelte';
    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import Camera from '../../components/icons/Camera.svelte';
    import Search from '../../components/icons/Search.svelte';
    import { ButtonType, InputType } from '../../components/types.ts';

    // TODO: Add API calls to get document details using the Tracking Number (SPRINT 4)
    const docTrackingNumber = '1234567890';
    
    // TODO: Populate based on API calls (SPRINT 4)
    const docTitle = 'Document';

    const fileUrl = 'https://ocs.ceat.uplb.edu.ph/wp-content/uploads/2020/10/Dropping-Form.pdf';
    const fileName = 'Drop Form.pdf';

    const trail = [ // Contains dictionary with keys Office, In, Out, Elapsed Time, Action, Remarks
        {
            'Office': 'Department of Computer Science',
            'In': '2021-04-20 12:00:00', // Should be a DateTime object (SPRINT 4)
            'Out': '2021-04-20 12:00:00',
            'Elapsed Time': '30s',
            'Action': 'SENT',
            'Remarks': 'Done',
        },
        { // College of Engineering
            'Office': 'College of Engineering',
            'In': '2021-04-20 12:00:00',
            'Out': '',
            'Elapsed Time': '',
            'Action': 'RECEIVED',
            'Remarks': 'Processing',
        },
    ];

    const overview = {
        'Document Title': 'Document',
        'Document Tracking Number': docTrackingNumber,
        'Document Type': 'Letter',
        'Document For': 'Distribution/disubursement',
        'Document Remarks': 'LGTM!',
        'Originating Office': 'Department of Computer Science', // TODO: Given ID, get office name
        'Current Office': 'College of Engineering',
        'Document Status': 'SENT',
    };
</script>

<svelte:head>
    <title>DocTrack | {docTitle}</title>
</svelte:head>


<main>
    
    <TopBar show={true} currentPage={`Tracking: ${docTrackingNumber}`}> 
        <nav>
            <TextInput type={InputType.Primary} placeholder='Enter tracking number here...' label=''/>
            <Button type={ButtonType.Primary}><Camera alt='Take/select an image.' /></Button>
            <a href='/track'>
                <Button type={ButtonType.Primary}><Search alt='Search specified tracking number. '/></Button>
            </a>
        </nav>
    </TopBar>
    <h2>Document {docTitle}</h2>

    <Button>
        <Notification /> Subscribe to Push Notifications
    </Button>
    <section>
        <table>
            <tr>
                <td><p class='header-color'><b>Overview</b></p></td>
                <td></td>
            </tr>
            {#each Object.keys(overview) as key}
                <tr>
                    <td><b>{key}</b></td>
                    <td>{overview[key]}</td>
                </tr>
            {/each}
        </table>
        <br>
        <table>
            <th class='table-title'>Files</th>
            <tr><a href={fileUrl}>{fileName}</a></tr>
        </table>
        <br>
        <table>
            <th class='table-title'>History</th>
            <tr><b>Office</b></tr>
            <tr><b>Remarks</b></tr>
            <tr><b>Date</b></tr>
        </table>
        <br>
        <table>
            <th class='table-title'>Paper Trail</th>
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
        </table>
    </section>
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