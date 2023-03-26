<script>
    import active from 'svelte-spa-router/active';
    export let show = false;
</script>

<nav class:show={show} on:click|stopPropagation on:keypress>
    <section>
        <a href="#/inbox" use:active>Inbox</a>
        <a href="#/outbox" use:active>Outbox</a>
        <a href="#/drafts" use:active>Drafts</a>
        <a href="#/barcodes" use:active>Manage Barcodes</a>
        <a href="#/invites" use:active>Manage Invites</a>
        <a href="#/staff" use:active>Manage Staff</a>
        <a href="#/admin" use:active>Manage Administrators</a>
        <a href="#/metrics" use:active>Metrics</a>
        <a href="#/settings" use:active>Settings</a>
    </section>
    <form method="POST" action="/auth/logout">
        <input type="submit" value="Logout" />
    </form>
</nav>

<style>
    @import url('../../../pages/vars.css');

    nav {
        background-color: var(--dashboard-bg);
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

    a:hover, input[type="submit"]:hover, :global(a.active) {
        background-color: var(--hover-color);
        border-right: var(--spacing-small) solid var(--primary-color);
    }
</style>
