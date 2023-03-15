<script lang="ts">
    import { Session } from '../../api/session.ts';
    import MediaQuery from "./../MediaQuery.svelte";

    import Button from '../../components/ui/Button.svelte';
    import Logout from '../../components/icons/Logout.svelte';

    import { ButtonType } from '../../components/types.ts';

    let mobile = false;

    // TODO: Updates based on permissions
    const navItems = [
        { label: "Inbox", href: "#inbox" },
        { label: "Outbox", href: "#outbox" },
        { label: "Drafts", href: "#drafts" },
        { label: "Barcodes", href: "#barcodes" },
        { label: "Metrics", href: "#metrics" },
        { label: "Manage Invites", href: "#invites" },
        { label: "Manage Staff", href: "#staff" },
        { label: "Manage Administrators", href: "#admins" },
        { label: "Manage Global Settings", href: "#globalsettings" },
    ];

</script>
<MediaQuery query="(max-width: 768px)" let:matches>
<div>
    <nav class="{matches ? 'mobile' : ''}">
        <p class="profile">
            {#await Session.getUser()}
                Hello!
            {:then user}
                Hello, {user.name}! {matches ? `(Mobile)` : `(Desktop)`}
            {/await}
        </p>
        <ul class="navelements">
            {#each navItems as item}
                <li><a href={item.href} class="navitem">{item.label}</a></li>
            {/each}
            <li><form method="POST" action="/auth/logout" class="navitem">
                    <input type="submit" value="Logout" />
                </form>
            </li>
        </ul>
    </nav>
</div>
</MediaQuery>

<style>
    nav {
        background-color: blueviolet;
        box-shadow: 0 1px 8px #ddd;
        position: sticky;
    }

    .navelements {
        display: flex;
        flex-direction: row-reverse;
        flex-flow: row wrap;
        justify-content: space-around;
        list-style-type: none;
    }
    
    .navitem {
        list-style: none;
        padding: 1em;
        background: none;
        text-decoration: none;
        background-color: pink;
        display: inline-block;
    }

    .navitem:hover {
        background-color: blue;
        transition: all 0.3s ease 0s;
    }
    
    .mobile {
        background-color: green;
    }

    .profile {
        display: inline-block;
        margin: 0;
    }
</style>
