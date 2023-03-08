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
    <div class="leftalign">Hello, {username}!</div>
    <div class="rightalign"><a href="/"><Button type={ButtonType.Primary}><Logout /></Button></a></div>
    <div class="centeralign">Doctrack!</div>
</div>

<style>
    .topbar {
        background: #ffb334;
        align-items: left;
        padding: 0pt;
        position:fixed;
        width:100%;
        height:30pt;
        padding:5pt;
        left:0;
        top:0;
    }
    .leftalign {
        text-align: left;
    }
    .rightalign {
        text-align: right;
    }
    .centeralign {
        text-align: center;
    }
</style>