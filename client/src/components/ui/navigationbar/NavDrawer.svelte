<script>
    export let show = false;
</script>

<nav class:show={show}>
    <section>
        <a href="#/inbox">Inbox</a>
        <a href="#/outbox">Outbox</a>
        <a href="#/drafts">Drafts</a>
        <a href="#/barcodes">Manage Barcodes</a>
        <a href="#/invites">Manage Invites</a>
        <a href="#/staff">Manage Staff</a>
        <a href="#/admin">Manage Administrators</a>
        <a href="#/metrics">Metrics</a>
        <a href="#/settings">Settings</a>
    </section>
    <form method="POST" action="/auth/logout">
        <input type="submit" value="Logout" />
    </form>
</nav>

<style>
    @import url('../../../pages/vars.css');

    nav {
        background-color: var(--nav-bg);
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-between;
        max-width: 300px;
        left: -100%;
        position: absolute;
        transition: left var(--animation-length);
    }

    nav.show {
        left: 0;
    }
  
    a {
        color: initial;
        display: block;
        padding: var(--spacing-normal);
        text-decoration: none;
        transition: background-color var(--animation-length), border-left var(--animation-length);
    }

    a:hover {
        background-color: #eee;
        
    }

    input[type="submit"] {
        background-color: var(--bg-color);
        cursor: pointer;
        margin: 0;
        padding: var(--spacing-normal);
        text-align: initial;
        transition: background-color var(--animation-length);
        width: 100%;
    }

    input[type="submit"]:hover {
        background-color: #aaa;
    }
</style>
