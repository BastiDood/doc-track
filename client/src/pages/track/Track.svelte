<script>
    import Notification from '../../components/icons/Notification.svelte';
    import Button from '../../components/ui/Button.svelte';
    
    let docTitle = 'Document';
    let docTrackingNumber = '1234567890';
    let docType = "Letter";
    let docFor = "Distribution/disubursement";
    let dorRemarks = "LGTM!";
    let dorOriginOffices = 0;
    let dorCurrOffice = "College of Engineering";
    
    let dorStatus = "SENT";

    let fileUrl = "https://ocs.ceat.uplb.edu.ph/wp-content/uploads/2020/10/Dropping-Form.pdf"
    let fileName = "Drop Form.pdf"
</script>


<main>
    <h2>Document {docTitle}</h2>

    <Button>
        <Notification /> Subscribe to Push Notifications
    </Button>
    <section>
        <table>
            <th class="table-title">Document Details</th>
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
                <td>{dorRemarks}</td>
            </tr>
            <tr>
                <td><b>Originating Office</b></td>
                <td>{dorOriginOffices}</td>
            </tr>
            <tr>
                <td><b>Current Office</b></td>
                <td>{dorCurrOffice}</td>
            </tr>
            <tr>
                <td><b>Status</b></td>
                <td class="header-color">{dorStatus}</td>
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
        padding: var(--spacing-small);
        left: 1em;
        border-spacing: var(--spacing-small);
        color: var(--color-primary);
        width: 100%;
        padding: 1em;
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