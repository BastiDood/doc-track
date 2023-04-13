<script>
    import active from 'svelte-spa-router/active';
    import LogoutIcon from '../../icons/Logout.svelte';

    import InboxIcon from '../../icons/DocumentDownload.svelte';
    import OutboxIcon from '../../icons/DocumentExport.svelte';
    import DraftsIcon from '../../icons/Events.svelte';
    import BarcodesIcon from '../../icons/Barcode.svelte';
    import InvitesIcon from '../../icons/PersonAdd.svelte';
    import StaffIcon from '../../icons/PersonMail.svelte';
    import AdminIcon from '../../icons/PersonInfo.svelte';
    import MetricsIcon from '../../icons/Events.svelte';
    import SettingsIcon from '../../icons/Settings.svelte';


    export let show = false;

    // TODO: Change to individual permissions
    /*
        0 - No permissions
        1 - Staff
        2 - Admin
        3 - Operator
    */
    export let permission = 3;
    export let selected = "Inbox";
</script>

<nav class:show={show} on:click|stopPropagation on:keypress>
    <section>
        {#if permission >= 1}
            <a href="#/inbox" class="unselectable" use:active><InboxIcon />Inbox</a>
            <a href="#/outbox" class="unselectable" use:active><OutboxIcon />Outbox</a>
            <a href="#/drafts" class="unselectable" use:active><DraftsIcon />Drafts</a>
            <a href="#/metrics" class="unselectable" use:active><MetricsIcon />Metrics</a>            
        {/if}
        {#if permission >= 2}
            <a href="#/barcodes" class="unselectable" use:active><BarcodesIcon />Barcodes</a>
            <a href="#/invites" class="unselectable" use:active><InvitesIcon />Invites</a>
            <a href="#/staff" class="unselectable" use:active><StaffIcon />Staff</a>
        {/if}
        {#if permission >= 3}
            <a href="#/admin" class="unselectable" use:active><AdminIcon />Admin</a>
            <a href="#/settings" class="unselectable" use:active><SettingsIcon />Settings</a>
            <a href="#/sandbox" class="unselectable" use:active><SettingsIcon />Sandbox</a>
        {/if}
    </section>
    <form method="POST" action="/auth/logout">
        <input type="submit" value="Logout" />
    </form>
</nav>
<style>
    @import url('../../../pages/vars.css');

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
    }

    .show {
        left: 0;
    }
  
    a {
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

    .unselectable {
        user-select:none;
    }

    a:hover, input[type="submit"]:hover, :global(a.active) {
        background-color: var(--hover-color);
        border-right: var(--spacing-small) solid var(--primary-color);
    }
</style>
