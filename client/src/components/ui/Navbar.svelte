<script lang="ts">
    import Button from '../../components/ui/Button.svelte';
    import Logout from '../../components/icons/Logout.svelte';

    import { ButtonType } from '../../components/types.ts';
    let contents = [
        {text:"Logout", icon:"", redirect:"/"},
        {text:"Dashboard", icon:"", redirect:"/dashboard"},
        {text:"Profile", icon:"", redirect:"/profile"},
    ]
    export let username: String;
</script>

<div class="topbar">
    <div class="leftalign">Hello, <br>{username}!</div>
    <nav class="navbar">
        {#each contents as content}
            <a href={content.redirect} class="navbarentry">{content.text}</a>
        {/each}
</div>

<style>
    .topbar {
        align-items: left;
        position:fixed;
        width:100%;
        height:30pt;
        padding:5pt;
        background-color: blueviolet;
        left:0;
        top:0;
    }
    .leftalign {
        text-align: left;
        float: left;
        padding-left: 5pt;
    }
    .navbar {
        text-align: right;
        float: right;
        margin-right: 5pt;
        height:30pt;
    }
    .navbarentry {
        margin-left: 5pt;
        border-left-style: solid;
        background-color: blueviolet;
        border: 1pt;
    }
    .navbarentry:hover {
        background-color: blue;
    }
</style>