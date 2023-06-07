<script lang="ts">
    import active from 'svelte-spa-router/active';

    import type { Office } from '~model/office.ts';
    import type { User } from '~model/user.ts';
    import { checkAnyPerms } from '../forms/permissions/util.ts';
    import { Local, Global } from '../../../../../model/src/permission.ts';

    import { userOffices, userSession } from '../../../stores/UserStore.ts';
    import { dashboardState } from '../../../stores/DashboardState.ts';

    import { ButtonType, IconColor } from '../../types.ts';
    import { goToTrackingPage } from '../itemrow/util.ts';

    import AdminIcon from '../../icons/PersonInfo.svelte';
    import BarcodesIcon from '../../icons/Barcode.svelte';
    import Button from '../../ui/Button.svelte';
    import Camera from '../../icons/Camera.svelte';
    import ChartClusterBar from '../../icons/ChartClusterBar.svelte';
    import Document from '../../icons/DocumentBlank.svelte';
    import EventsIcon from '../../icons/Events.svelte';
    import InboxIcon from '../../icons/DocumentDownload.svelte';
    import InvitesIcon from '../../icons/PersonAdd.svelte';
    import Modal from '../Modal.svelte';
    import OfficeSelect from '../OfficeSelect.svelte';
    import OutboxIcon from '../../icons/DocumentExport.svelte';
    import QrScanner from '../QRScanner.svelte';
    import Search from '../../icons/Search.svelte';
    import SettingsIcon from '../../icons/Settings.svelte';
    import StaffIcon from '../../icons/PersonMail.svelte';
    import TextInput from '../../ui/TextInput.svelte';

    export let user: User | undefined;
    export let show = false as boolean;

    let trackingNumber: string | undefined;
    let selectedOffice: Office['id'] | null = null;
    let showScan = false as boolean;

    $: dashboardState.setOffice(selectedOffice);

    function scanHandler({ detail }: CustomEvent<string>) {
        goToTrackingPage(detail);
    }

    $: localPermission = selectedOffice === null
        ? null
        : $userSession?.local_perms[selectedOffice] ?? null;
    $: globalPermission = $userSession?.global_perms ?? null;
</script>

<nav class:show on:click|stopPropagation on:keypress>
    <main>
        <header id="controls">
            {#if typeof user !== 'undefined'}
                <div>Hello {user.name}!</div>
            {/if}
            {#if Object.getOwnPropertyNames($userOffices).length === 0}
                No office detected!
            {:else}
                <OfficeSelect offices={$userOffices} bind:oid={selectedOffice} />
            {/if}
            <div>
                <Button type={ButtonType.Primary} on:click={() => (showScan = true)}><Camera color={IconColor.White} alt="Take/select an image." /></Button>
                <Button type={ButtonType.Primary}><Search color={IconColor.White} alt="Search specified tracking number." /></Button>
            </div>
            <TextInput name="trackingnumber" placeholder="Enter tracking number here..." label="" bind:value={trackingNumber} />
        </header>
        <section>
            {#if localPermission}
                {#if checkAnyPerms(localPermission, Local.ViewInbox)}
                    <a href="#/inbox" use:active><InboxIcon alt="Go to Inbox" />Inbox</a>
                    <a href="#/outbox" use:active><OutboxIcon alt="Go to Outbox" />Outbox</a>
                    <a href="#/dossier" use:active><Document alt="Go to Dossier" />Dossier</a>
                {/if}
                <a href="#/metrics" use:active><ChartClusterBar alt="Go to Metrics" />Metrics</a>
                {#if checkAnyPerms(localPermission, Local.ViewBatch)}
                    <a href="#/barcodes" use:active><BarcodesIcon alt="Go to Barcodes" />Barcodes</a>
                {/if}
                {#if checkAnyPerms(localPermission, Local.AddInvite
                    | Local.RevokeInvite)}
                    <a href="#/invites" use:active><InvitesIcon alt="Manage Invites" />Invites</a>
                {/if}
                {#if checkAnyPerms(localPermission, Local.AddStaff
                    | Local.RemoveStaff
                    | Local.UpdateStaff)}
                    <a href="#/staff" use:active><StaffIcon alt="Manage Staff" />Staff</a>
                {/if}
            {/if}
            {#if globalPermission}
                {#if checkAnyPerms(globalPermission, Global.UpdateUser)}
                    <a href="#/users" use:active><AdminIcon alt="Manage Users" />Users</a>
                {/if}
                {#if checkAnyPerms(globalPermission, Global.CreateCategory
                    | Global.UpdateCategory
                    | Global.DeleteCategory
                    | Global.ActivateCategory)}
                    <a href="#/categories" use:active><SettingsIcon alt="Manage Categories" />Categories</a>
                {/if}
                {#if checkAnyPerms(globalPermission, Global.CreateOffice | Global.UpdateOffice)}
                    <a href="#/offices" use:active><EventsIcon alt="Go to Offices" />Offices</a>
                {/if}
            {/if}
        </section>
    </main>
    <form id="logout" method="POST" action="/auth/logout">
        <input type="submit" value="Logout" />
    </form>
</nav>

{#if showScan}
    <Modal showModal on:close={() => (showScan = false)} title="Scan/Select a File">
        <QrScanner on:onDocumentScan={scanHandler} />
    </Modal>
{/if}

<style>
    #controls {
        display: flex;
        align-items: stretch;
        flex-direction: column;
    }

    form {
        margin: 0;
        padding: 0;
    }
    
    header > div {
        display: flex;
        justify-content: center;
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
    
    main {
        overflow-y: auto;
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
</style>
