<script>
    import active from 'svelte-spa-router/active';

    import InboxIcon from '../../icons/DocumentDownload.svelte';
    import OutboxIcon from '../../icons/DocumentExport.svelte';
    import EventsIcon from '../../icons/Events.svelte';
    import BarcodesIcon from '../../icons/Barcode.svelte';
    import InvitesIcon from '../../icons/PersonAdd.svelte';
    import StaffIcon from '../../icons/PersonMail.svelte';
    import AdminIcon from '../../icons/PersonInfo.svelte';
    import SettingsIcon from '../../icons/Settings.svelte';

    export let show = false;
</script>

<nav class:show={show} on:click|stopPropagation on:keypress>
    <section>
        <a href="#/inbox" use:active><InboxIcon />Inbox</a>
        <a href="#/outbox" use:active><OutboxIcon />Outbox</a>
        <a href="#/drafts" use:active><EventsIcon />Drafts</a>
        <a href="#/metrics" use:active><EventsIcon />Metrics</a>
        <a href="#/barcodes" use:active><BarcodesIcon />Barcodes</a>
        <a href="#/invites" use:active><InvitesIcon />Invites</a>
        <a href="#/staff" use:active><StaffIcon />Staff</a>
        <a href="#/admin" use:active><AdminIcon />Admin</a>
        <a href="#/settings" use:active><SettingsIcon />Settings</a>
        <a href="#/sandbox" use:active><SettingsIcon />Sandbox</a>
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
        height: calc(100% - var(--topbar-height));
        justify-content: space-between;
        max-width: 300px;
        top: var(--topbar-height);
        left: -100%;
        position: fixed;
        transition: left var(--animation-length);
        z-index: 1;
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

    a:hover, input[type="submit"]:hover, :global(a.active) {
        background-color: var(--hover-color);
        border-right: var(--spacing-small) solid var(--primary-color);
    }
</style>
