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
    <div class="rightalign"><a href="/"><Button type={ButtonType.Primary}><Logout /></Button></a></div>
</div>

<style>
    .topbar {
        align-items: left;
        position:fixed;
        width:100%;
        height:30pt;
        padding:5pt;
        left:0;
        top:0;
    }
    .leftalign {
        text-align: left;
        float: left;
        padding-left: 5pt;
    }
    .rightalign {
        text-align: right;
        float: right;
        margin-right: 5pt;
    }
</style>