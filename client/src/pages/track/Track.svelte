<script>

    // TODO: Add API calls to get document details using the Tracking Number
    import Notification from '../../components/icons/Notification.svelte';
    import Button from '../../components/ui/Button.svelte';
    import TextInput from '../../components/ui/TextInput.svelte';
    import TopBar from '../../components/ui/navigationbar/TopBar.svelte';
    import Camera from '../../components/icons/Camera.svelte';
    import Search from '../../components/icons/Search.svelte';
    import { ButtonType, IconColor, InputType } from '../../components/types.ts';

    let docTrackingNumber = '1234567890';
    
    let docTitle = 'Document';
    let docType = "Letter";
    let docFor = "Distribution/disubursement";
    let docRemarks = "LGTM!";
    let docOriginOffices = 0;
    let docCurrOffice = "College of Engineering";
    
    let docStatus = "SENT";

    let fileUrl = "https://ocs.ceat.uplb.edu.ph/wp-content/uploads/2020/10/Dropping-Form.pdf";
    let fileName = "Drop Form.pdf";

    let trail = [
        [
            "Department of Computer Science",
            "22/12/22",
        ],
        []
    ];
</script>


<main>
    <title>DocTrack | {docTitle}</title>
    <TopBar show={true} currentPage={"Tracking View"}> 
        <TextInput type={InputType.Primary} placeholder="Enter tracking number here..." label=""/>
        <Button type={ButtonType.Primary}><Camera alt="Take/select an image." /></Button>
        <a href="/track">
            <Button type={ButtonType.Primary}><Search alt="Search specified tracking number. "/></Button>
        </a>
    </TopBar>
    <h2>Document {docTitle}</h2>

    <Button>
        <Notification /> Subscribe to Push Notifications
    </Button>
    <section>
        <table>
            <tr>
                <td><b>Overview</b></td>
                <td></td>
            </tr>
            <tr>
                <td><b>Document Tracking Number</b></td>
                <td>{docTrackingNumber}</td>
            </tr>
            <tr>
                <td><b>Document Type</b></td>
                <td>{docType}</td>
            </tr>
            <tr>
                <td><b>Document For</b></td>
                <td>{docFor}</td>
            </tr>
            <tr>
                <td><b>Remarks</b></td>
                <td>{docRemarks}</td>
            </tr>
            <tr>
                <td><b>Originating Office</b></td>
                <td>{docOriginOffices}</td>
            </tr>
            <tr>
                <td><b>Current Office</b></td>
                <td>{docCurrOffice}</td>
            </tr>
            <tr>
                <td><b>Status</b></td>
                <td class="header-color">{docStatus}</td>
            </tr>
        </table>


        <table>
            <th class="table-title">Files</th>
            <tr><a href={fileUrl}>{fileName}</a></tr>
        </table>

        <table>
            <th class="table-title">History</th>
            <tr><b>Office</b></tr>
            <tr><b>Remarks</b></tr>
            <tr><b>Date</b></tr>
        </table>
    </section>
</main>

<style>
    @import url('../../pages/vars.css');
    table {
        border: 3px solid;
        padding: var(--spacing-large);
        left: 1em;
        border-spacing: var(--spacing-small);
        border-collapse: separate;
        color: var(--color-primary);
        width: 100%;
    }
    .table-title {
        color: var(--color-primary);
        font-size: var(--font-size-large);
    }

    .header-color {
        color: var(--color-primary);
    }


    tr {
        border: 1px solid;
        border-radius: var(--border-radius);
        border-color : var(--color-primary);
    }
</style>