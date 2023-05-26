<script lang="ts">
    import active from 'svelte-spa-router/active';
    import { Office } from '~model/office.ts';
    import { userOffices } from '../../../stores/UserStore.ts';
    import { dashboardState } from '../../../stores/DashboardState.ts';
    import { goToTrackingPage } from '../itemrow/util.ts';

    import InboxIcon from '../../icons/DocumentDownload.svelte';
    import OutboxIcon from '../../icons/DocumentExport.svelte';
    import Document from '../../icons/DocumentBlank.svelte';
    import EventsIcon from '../../icons/Events.svelte';
    import BarcodesIcon from '../../icons/Barcode.svelte';
    import InvitesIcon from '../../icons/PersonAdd.svelte';
    import StaffIcon from '../../icons/PersonMail.svelte';
    import AdminIcon from '../../icons/PersonInfo.svelte';
    import SettingsIcon from '../../icons/Settings.svelte';
    import ChartClusterBar from '../../icons/ChartClusterBar.svelte';
    import OfficeSelect from '../OfficeSelect.svelte';

    import LogoSidedrawer from '../../logo/LogoSidedrawer.svelte';

    export let show = false;

    import { ButtonType, IconColor } from '../../types.ts';
    import QrScanner from '../QRScanner.svelte';
    import Modal from '../Modal.svelte';
    import TextInput from '../../ui/TextInput.svelte';
    import Button from '../../ui/Button.svelte';
    import Search from '../../icons/Search.svelte';
    import Camera from '../../icons/Camera.svelte';
    let trackingNumber: string | null = '';

    let selectedOffice: Office['id'] | null = null;
    let showScan = false;

    $: dashboardState.setOffice(selectedOffice);

    function scanHandler({ detail }: CustomEvent<string>) {
        goToTrackingPage(detail);
    }
</script>

<nav class:show on:click|stopPropagation on:keypress>
    <section>
        <center>
            <LogoSidedrawer alt='Logo' />
        </center>
        <header>
            {#if Object.getOwnPropertyNames($userOffices).length === 0}
                No office detected!
            {:else}
                <OfficeSelect offices={$userOffices} bind:oid={selectedOffice} />
            {/if}
            <div>
                <Button type={ButtonType.Primary} on:click={() => (showScan = true)}><Camera color={IconColor.White} alt="Take/select an image." /></Button>
                <TextInput placeholder="Enter tracking number here..." label="" bind:value={trackingNumber} />
                <Button type={ButtonType.Primary}><Search color={IconColor.White} alt="Search specified tracking number." /></Button>
            </div>
        </header>
        <a href="#/inbox" use:active><InboxIcon alt="Go to Inbox" />Inbox</a>
        <a href="#/outbox" use:active><OutboxIcon alt="Go to Outbox" />Outbox</a>
        <a href="#/dossier" use:active><Document alt="Go to Dossier" />Dossier</a>
        <a href="#/metrics" use:active><ChartClusterBar alt="Go to Metrics" />Metrics</a>
        <a href="#/barcodes" use:active><BarcodesIcon alt="Go to Barcodes" />Barcodes</a>
        <a href="#/invites" use:active><InvitesIcon alt="Manage Invites" />Invites</a>
        <a href="#/staff" use:active><StaffIcon alt="Manage Staff" />Staff</a>
        <a href="#/users" use:active><AdminIcon alt="Manage Users" />Users</a>
        <a href="#/categories" use:active><SettingsIcon alt="Manage Categories" />Categories</a>
        <a href="#/offices" use:active><EventsIcon alt="Go to Offices" />Offices</a>
    </section>
    <form method="POST" action="/auth/logout">
        <input type="submit" value="Logout" />
    </form>
</nav>

{#if showScan}
    <Modal showModal on:close={() => (showScan = false)} title="Scan/Select a File">
        <QrScanner on:onDocumentScan={scanHandler} />
    </Modal>
{/if}

<style>
    @import url('../../../pages/vars.css');

    center {
        margin: 0;
    }

    nav {
        background-color: var(--dashboard-sidedrawer);
        display: flex;
        flex-direction: column;
        font-family: inherit;
        height: 100%;
        justify-content: space-between;
        max-width: 300px;
        left: -100%;
        position: absolute;
        transition: left var(--animation-length);
        z-index: 1;
    }

    .show {
        left: 0;
    }
  
    header {
        margin: var(--large);
    }
    
    section > a {
        border-right: var(--spacing-small) solid transparent;
        color: initial;
        display: block;
        padding: var(--spacing-normal);
        text-decoration: none;
        transition: background-color var(--animation-length), border-right var(--animation-length);
    }

    input[type="submit"] {
        background-color: var(--dashboard-bg);
        border-top: 0;
        border-bottom: 0;
        border-left: 0;
        border-right: var(--spacing-small) solid transparent;
        cursor: pointer;
        font-family: inherit;
        margin: 0;
        outline: 0;
        padding: var(--spacing-normal);
        text-align: initial;
        transition: background-color var(--animation-length), border-right var(--animation-length);
        width: 100%;
    }

    section > a:hover, input[type="submit"]:hover, :global(a.active) {
        background-color: var(--hover-color);
        border-right: var(--spacing-small) solid var(--primary-color);
    }

    div {
        display: flex;
        align-items: stretch;
        flex-direction: column;
    }
</style>
