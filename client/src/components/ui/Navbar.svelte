<script lang="ts">
    import { Session } from '../../api/session.ts';
    import { onMount } from "svelte";

    import Button from '../../components/ui/Button.svelte';
    import Logout from '../../components/icons/Logout.svelte';

    import { ButtonType } from '../../components/types.ts';

    let mobile = false;

    // TODO: Updates based on permissions
    const navItems = [
        { label: "logo", href: "#" },
        { label: "Item 1", href: "#" },
        { label: "Item 2", href: "#" },
        { label: "Item 3", href: "#" },
        { label: "Item 4", href: "#" },
        { label: "Item 5", href: "#" },
        { label: "Item 6", href: "#" },
        { label: "Item 7", href: "#" }
    ];
</script>

<nav>
    <p>
        {#await Session.getUser()}
            Hello!
        {:then user}
            Hello, {user.name}!
        {/await}
    </p>
        <ul class="navelements">
            {#each navItems as item}
                <li><a href={item.href} class="navitem">item.label</a></li>
            {/each}
            <li><form method="POST" action="/auth/logout" class="navitem">
                    <input type="submit" value="Logout" />
                </form>
            </li>
        </ul>
</nav>

<style>
    nav {
        display: flex;
        background-color: blueviolet;
        justify-content: space-between;
        align-items: flex-start;
        box-shadow: 0 1px 8px #ddd;
        padding: 0.5rem;
        position: sticky;
    }

    .navelements {
        display: flex;
        justify-content: flex-end;
        list-style-type: none;
        align-items: stretch;
    }
    
    .navitem {
        list-style: none;
        padding: 1em;
        display: inline-block;
    }

    .navitem:hover {
        background-color: blue;
    }
    

    p {
        margin: 0;
    }
</style>
